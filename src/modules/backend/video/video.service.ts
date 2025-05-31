import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Video } from './entities/video.entity';
import { SearchVideoService } from './video-search.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

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
            user: video.user,
        };
    
        this.client.emit('index_video', { index: 'videos', document: formattedVideo }).subscribe();
        return formattedVideo;
    }
    

    async create(createVideoDto: CreateVideoDto) {
        const video = new Video();
        video.title = createVideoDto.title;
        video.description = createVideoDto.description;
        video.image = createVideoDto.image;
        video.isActive = createVideoDto.isActive ?? true;
        video.path = createVideoDto.path;

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

        const formattedVideo = await this.formatAndIndexVideo(result);
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
        const video = await this.videoRepository.findOne({
            where: { id },
            relations: ['categories']
        });
        if (!video) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }
        return video;
    }

    async reindexAllToES() {
        const videos = await this.videoRepository.find();
        const formattedVideos = await Promise.all(videos.map(video => this.formatAndIndexVideo(video)));
        console.log(`🗃️ DB có ${videos.length} video`);
        return {
            message: 'Reindex all videos to ES successfully',
            videos: formattedVideos,
        };
    }
}