import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Video } from './entities/video.entity';
import { SearchVideoService } from './video-search.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { User } from 'src/modules/backend/user/entities/user.entity';
import { RedisService } from 'src/service/redis/redis.service';

@Injectable()
export class VideoService {
    constructor(
        @InjectRepository(Video)
        private videoRepository: Repository<Video>,
        private SearchVideoService: SearchVideoService,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
        private readonly redisService: RedisService
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
            createdAt: video.createdAt.toISOString(),
        };

        this.client.emit('index_video', {
            index: 'videos',
            document: formattedVideo,
        }).subscribe();

        return formattedVideo;
    }


    async create(createVideoDto: CreateVideoDto) {
        const video = new Video();
        video.title = createVideoDto.title;
        video.description = createVideoDto.description;
        video.image = createVideoDto.image;
        video.isActive = createVideoDto.isActive ?? true;
        video.path = createVideoDto.path;

        if (!createVideoDto.userId) {
            throw new HttpException('UserId is required', HttpStatus.BAD_REQUEST);
        }

        // Kiểm tra userId có tồn tại không
        const user = await this.videoRepository.manager.getRepository(User).findOne({
            where: { id: createVideoDto.userId }
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
        });

        if (!video) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }

        video.title = updateVideoDto.title ?? video.title;
        video.description = updateVideoDto.description ?? video.description;
        video.image = updateVideoDto.image ?? video.image;
        video.isActive = updateVideoDto.isActive ?? video.isActive;
        video.path = updateVideoDto.path ?? video.path;

        const result = await this.videoRepository.save(video);

        await this.formatAndIndexVideo(result);
        return {
            message: 'Video updated successfully',
        };
    }


    async searchVideos(q: string, page = 1, limit = 2) {
        return this.SearchVideoService.searchAdvanced(q, page, limit);
    }

    async findAll(page = 1, limit = 2): Promise<{ data: Video[]; total: number; page: number; limit: number }> {
        const [data, total] = await this.videoRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit,
        });
        return { data, total, page, limit };
    }

    async delete(id: number): Promise<void> {
        const result = await this.videoRepository.delete(id);
        if (result.affected === 0) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }
    }

    async removeVideo(videoId: number) {
        await this.videoRepository.delete(videoId); // xoá trong DB
        const result = await this.SearchVideoService.deleteVideoFromIndex(videoId); // xoá trong ES
        return {
            message: 'Video deleted from DB and ES.',
            result: result,
        };
    }

    async findOne(id: number) {
        const video = await this.videoRepository
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
                'user.id',
                'user.fullname',
                'user.avatar',
            ])
            .where('video.id = :id', { id })
            .getOne();

        if (!video) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }
        return video;
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
                'user.id',
                'user.fullname',
                'user.avatar'
            ])
            .getMany();

        const formattedVideos = await Promise.all(videos.map(video => this.formatAndIndexVideo(video)));
        console.log(`🗃️ DB có ${videos.length} video`);
        return {
            message: 'Reindex all videos to ES successfully',
            videos: formattedVideos,
        };
    }

    async recordView(videoId: string, ip: string) {
        const lockKey = `viewlock:${videoId}:${ip}`;
        const viewed = await this.redisService.get(lockKey);
        if (viewed) return; // đã xem

        await this.redisService.set(lockKey, '1', 600); // TTL 10 phút
        await this.redisService.incr(`video:${videoId}:views`);
    }

    async syncViewsToDatabase() {
        const keys = await this.redisService.keys('video:*:views');
        for (const key of keys) {
            const videoId = parseInt(key.split(':')[1], 10);
            const countStr = await this.redisService.get(key);
            const count = countStr ? parseInt(countStr, 10) : 0;
            if (count > 0) {
                await this.videoRepository.increment({ id: videoId }, 'view', count);
                await this.redisService.del(key);
                console.log(`Synced ${count} views for video ${videoId}`);
            }
        }
    }
}