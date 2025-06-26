import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { RedisService } from 'src/service/redis/redis.service';
import { Video } from '../video/entities/video.entity';

@Injectable()
export class LikeService {
    constructor(
        @InjectRepository(Like)
        private readonly likeRepository: Repository<Like>,
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
        private readonly redisService: RedisService,
    ) { }

    async create(dto: CreateLikeDto, userId: number): Promise<any> {
        const redisKey = `user:${userId}:likes:video:${dto.video_id}`;
        const likeDb = {
            user_id: userId,
            video_id: dto.video_id,
            is_liked: true
        }
        await this.redisService.setJson(redisKey, likeDb, 60 * 60 * 24);
        const likeRedis = await this.redisService.get(redisKey);
        return {
            message: 'Like created successfully'
        };
    }

    async remove(videoId: number, userId: number): Promise<any> {
        const redisKey = `user:${userId}:likes:video:${videoId}`;
        const likeDb = {
            user_id: userId,
            video_id: videoId,
            is_liked: false
        }
        await this.redisService.setJson(redisKey, likeDb, 60 * 60 * 24);
        const like = await this.redisService.get(redisKey);
        return {
            message: 'Like removed successfully'
        };
    }

    async checkLike(userId: number, videoId: number): Promise<any> {
        const redisKey = `user:${userId}:likes:video:${videoId}`;
        const likeRedis = await this.redisService.getJson(redisKey);
        
        if(likeRedis && likeRedis.is_liked === true) {
            return {
                isLiked: true,
                message: 'Like checked successfully'
            };
        }
        const likeDb = await this.likeRepository.findOne({
            where: {
                user_id: userId,
                video_id: videoId
            }
        });
        if(likeDb) {
            return {
                isLiked: true,
                message: 'Like checked successfully'
            };
        }
        return {
            isLiked: false,
            message: 'Like checked successfully'
        };
    }

    async syncLikeRedisToDatabase() {
        const likes = await this.redisService.keys('user:*:likes:video:*');
        const updatedVideoIds = new Set<number>();

        if (likes.length > 0) {
            for (const like of likes) {
                const likeRedis = await this.redisService.getJson(like);
                if (likeRedis) {
                    const videoId = Number(likeRedis.video_id);
                    const userId = Number(likeRedis.user_id);

                    if (likeRedis.is_liked === true) {
                        const likeDb = await this.likeRepository.findOne({
                            where: { video_id: videoId, user_id: userId }
                        });
                        if (!likeDb) {
                            await this.likeRepository.save({
                                user_id: userId,
                                video_id: videoId,
                                is_liked: true
                            });
                        }
                    } else {
                        await this.likeRepository.delete({
                            video_id: videoId,
                            user_id: userId
                        });
                    }
                    updatedVideoIds.add(videoId);
                }
                await this.redisService.del(like);
            }

            // Đếm lại số like và cập nhật vào bảng video
            for (const videoId of updatedVideoIds) {
                const likeCount = await this.likeRepository.count({
                    where: { video_id: videoId }
                });
                await this.videoRepository.update(
                    { id: videoId },
                    { like: likeCount } // Đổi 'like' thành tên cột thực tế nếu khác
                );
            }
        }
    }
}