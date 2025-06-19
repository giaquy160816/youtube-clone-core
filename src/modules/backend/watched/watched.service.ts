import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Watched } from './entities/watched.entity';
import { Video } from '../video/entities/video.entity';
import { RedisService } from 'src/service/redis/redis.service';

@Injectable()
export class WatchedService {
    constructor(
        @InjectRepository(Watched)
        private readonly watchedRepository: Repository<Watched>,
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
        private readonly redisService: RedisService,
    ) { }

    async create(userId: number, videoId: number) {
        // check if video is already watched
        const watchedExist = await this.watchedRepository.findOne({
            where: { user_id: userId, video_id: videoId },
        });
        if (watchedExist) {
            throw new HttpException('Video already watched', HttpStatus.BAD_REQUEST);
        }
        // check video exist
        const videoExist = await this.videoRepository.findOne({
            where: { id: videoId },
        });
        if (!videoExist) {
            throw new HttpException('Video not found', HttpStatus.NOT_FOUND);
        }
        try {
            
            const watched = this.watchedRepository.create({
                user_id: userId,
                video_id: videoId,
                watched_at: new Date(),
            });
            this.watchedRepository.save(watched);
            await this.redisService.set(`watched:${userId}:${videoId}`, '1', 60 * 60 * 24);
            return { message: 'Watched successfully' };
        } catch (error) {
            throw new HttpException('Internal server error', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        
    }

    async getAllByUserId(userId: number, page: number = 1, limit: number = 10) {
        const [watched, total] = await this.watchedRepository.findAndCount({
            where: { user_id: userId },
            relations: ['video', 'video.user'],
            skip: (page - 1) * limit,
            take: limit,
            order: { watched_at: 'DESC' },
        });

        // Chuẩn hóa output giống videoService
        const data = watched.map(w => {
            const v = w.video;
            return {
                id: v.id,
                title: v.title,
                description: v.description,
                image: v.image,
                isActive: v.isActive,
                path: v.path,
                view: v.view,
                user_id: v.user?.id,
                user_fullname: v.user?.fullname,
                user_avatar: v.user?.avatar,
                tags: v.tags,
                createdAt: v.createdAt,
                watched_at: w.watched_at, // thêm thời gian đã xem nếu muốn
            };
        });

        return {
            data,
            total,
            page,
            limit,
        };
    }

    async delete(userId: number, videoId: number) {
        const watched = await this.watchedRepository.findOne({
            where: { user_id: userId, video_id: videoId },
        });
        if (!watched) {
            throw new HttpException('Not found or not allowed', HttpStatus.NOT_FOUND);
        }
        await this.watchedRepository.delete({ user_id: userId, video_id: videoId });
        await this.redisService.set(`watched:${userId}:${videoId}`, '0', 60 * 60 * 24);
        return { message: 'Deleted successfully' };
    }

    async checkWatched(userId: number, videoId: number) {
        // lưu vào redis
        const key = `watched:${userId}:${videoId}`;
        const watchedExist = await this.redisService.get(key);
        if (watchedExist) {
            return {
                isWatched: watchedExist === '1' ? true : false,
                message: 'Watched checked successfully'
            };
        }
        const watched = await this.watchedRepository.findOne({
            where: { user_id: userId, video_id: videoId },
        });
        await this.redisService.set(key, watched ? '1' : '0', 60 * 60 * 24);
        return {
            isWatched: watched ? true : false,
            message: 'Watched checked successfully'
        };
    }
}