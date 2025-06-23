import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { RedisService } from 'src/service/redis/redis.service';

@Injectable()
export class LikeService {
    constructor(
        @InjectRepository(Like)
        private readonly likeRepository: Repository<Like>,
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
        if(likes.length > 0) {
            for (const like of likes) {
                const likeRedis = await this.redisService.getJson(like);
                if(likeRedis && likeRedis.is_liked === true) {
                    const likeDb = await this.likeRepository.findOne({
                        where: { 
                            video_id: Number(likeRedis.video_id),
                            user_id: Number(likeRedis.user_id)
                        }
                    });
                    if(!likeDb) {
                        await this.likeRepository.save({
                            user_id: Number(likeRedis.user_id),
                            video_id: Number(likeRedis.video_id),
                            is_liked: true
                        });
                    }
                }else{
                    const result = await this.likeRepository.delete({
                        video_id: Number(likeRedis.video_id),
                        user_id: Number(likeRedis.user_id)
                    });
                }
                await this.redisService.del(like);
            }
        }
    }
}