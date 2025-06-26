// src/modules/shared/video/video-core.service.ts

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from 'src/modules/backend/video/entities/video.entity';
import { SearchVideoService } from 'src/modules/shared/video/video-search.service';
import { RedisService } from 'src/service/redis/redis.service';

@Injectable()
export class VideoCoreService {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
        private readonly searchVideoService: SearchVideoService,
        private readonly redisService: RedisService,
    ) { }

    async searchVideos(q: string, page = 1, limit = 2) {
        return this.searchVideoService.searchAdvanced(q, page, limit);
    }

    async findByIdOrFail(id: number) {
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
                'video.like',
                'video.isActive',
                'video.createdAt',
                'video.updatedAt',
                'video.tags',
                'user.id',
                'user.fullname',
                'user.avatar',
            ])
            .where('video.id = :id', { id })
            .getOne();

        if (!video){
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }
        const redisKey = `video:${id}:views`;

        // Tăng view Redis (Atomic)
        await this.redisService.incr(redisKey);

        // Lấy tổng view (DB + Redis)
        const redisViews = parseInt(await this.redisService.get(redisKey) || '0', 10);
        const view = video.view || 0;
        const totalViews = (view || 0) + redisViews;
        return {
            ...video,
            views: totalViews,
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
                await this.sysVideoToES(videoId);
            }
        }
    }

    async sysVideoToES(id: number) {
        const video = await this.videoRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!video) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }
        const formattedVideo: VideoDocument = {
            id: video.id,
            title: video.title,
            description: video.description,
            image: video.image,
            isActive: video.isActive,
            path: video.path,
            view: video.view,
            tags: video.tags,
            user_id: video.user?.id,
            user_fullname: video.user?.fullname,
            user_avatar: video.user?.avatar,
            createdAt: video.createdAt.toISOString(),
        };

        await this.searchVideoService.indexVideo('videos', formattedVideo);
        return {
            message: 'Sys video to ES successfully'
        };
    }
}