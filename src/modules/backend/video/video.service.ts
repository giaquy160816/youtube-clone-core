import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Video } from './entities/video.entity';
import { SearchVideoService } from 'src/modules/shared/video/video-search.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { User } from 'src/modules/backend/user/entities/user.entity';
import { join } from 'path';

@Injectable()
export class VideoService {
    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        private SearchVideoService: SearchVideoService,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
    ) {
    }

    async formatAndIndexVideo(video: Video) {
        const formattedVideo: VideoDocument = {
            id: video.id,
            title: video.title,
            description: video.description,
            image: video.image,
            isActive: video.isActive,
            path: video.path,
            view: video.view,
            user_id: video.user?.id,
            user_fullname: video.user?.fullname,
            user_avatar: video.user?.avatar,
            tags: video.tags,
            createdAt: video.createdAt.toISOString(),
        };

        if (video.path && video.path.includes('uploads/videos') && !video.path.includes('.m3u8')) {
            const finalDir = join(process.cwd(), video.path);
            this.client.emit('convert_video', {
                videoId: video.id,
                videoPath: finalDir
            }).subscribe();
        }

        this.client.emit('index_video', {
            index: 'videos',
            document: formattedVideo,
        }).subscribe();

        return formattedVideo;
    }

    async create(createVideoDto: CreateVideoDto, userId: number) {
        const video = new Video();
        video.title = createVideoDto.title;
        video.description = createVideoDto.description;
        video.image = createVideoDto.image;
        video.isActive = createVideoDto.isActive ?? true;
        video.path = createVideoDto.path;
        video.tags = createVideoDto.tags ?? [];

        // Kiểm tra userId có tồn tại không
        const user = await this.videoRepository.manager.getRepository(User).findOne({
            where: { id: userId }
        });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
        }
        video.user = user;

        const result = await this.videoRepository.save(video);

        const formattedVideo = await this.formatAndIndexVideo(result);
        return {
            message: 'Video created successfully',
            result: formattedVideo,
        };
    }

    async update(id: number, updateVideoDto: UpdateVideoDto) {
        const video = await this.videoRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!video) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }

        video.title = updateVideoDto.title ?? video.title;
        video.description = updateVideoDto.description ?? video.description;
        video.image = updateVideoDto.image ?? video.image;
        video.isActive = updateVideoDto.isActive ?? video.isActive;
        video.path = updateVideoDto.path ?? video.path;
        video.tags = updateVideoDto.tags ?? video.tags;
        video.user = video.user;

        const result = await this.videoRepository.save(video);

        await this.formatAndIndexVideo(result);
        return {
            message: 'Video updated successfully',
        };
    }

    async findAll(page = 1, limit = 2): Promise<{ data: Video[]; total: number; page: number; limit: number }> {
        const [data, total] = await this.videoRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }

    async delete(id: number, userId: number): Promise<any> {
        const video = await this.videoRepository.findOne({
            where: { id, user: { id: userId } },
        });
        if (!video) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }
        await this.videoRepository.remove(video);
        await this.SearchVideoService.deleteVideoFromIndex(id); // xoá trong ES
        return {
            message: 'Video deleted successfully.'
        };
    }

    async reindexAllToES() {
        const videos = await this.videoRepository
            .createQueryBuilder('video')
            .leftJoinAndSelect('video.user', 'user')
            .select([
                'video.id',
                'video.title',
                'video.description',
                'video.image',
                'video.path',
                'video.view',
                'video.isActive',
                'video.createdAt',
                'video.updatedAt',
                'video.tags',
                'user.id',
                'user.fullname',
                'user.avatar'
            ])
            .getMany();
        const formattedVideos = await Promise.all(videos.map(video => this.formatAndIndexVideo(video)));
        return {
            message: 'Reindex all videos to ES successfully',
            videos: formattedVideos,
        };
    }

    async findAllByUserId(userId: number, page = 1, limit = 2): Promise<{ data: Video[]; total: number; page: number; limit: number }> {
        const [data, total] = await this.videoRepository.findAndCount({
            where: { user: { id: userId } },
            order: {
                createdAt: 'DESC',
            },
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }

    async findById(id: number): Promise<Video> {
        const video = await this.videoRepository.findOne({
            where: { id },
        });
        if (!video) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }
        return video;
    }
}