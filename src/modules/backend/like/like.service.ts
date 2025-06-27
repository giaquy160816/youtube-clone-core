import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { GetLikedVideosDto } from './dto/get-liked-videos.dto';
import { RedisService } from 'src/service/redis/redis.service';
import { Video } from '../video/entities/video.entity';
import { SearchVideoService } from 'src/modules/shared/video/video-search.service';
import { formatDistance } from 'date-fns';
import { vi } from 'date-fns/locale';

@Injectable()
export class LikeService {
    constructor(
        @InjectRepository(Like)
        private readonly likeRepository: Repository<Like>,
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
        private readonly redisService: RedisService,
        private readonly searchVideoService: SearchVideoService,
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

    async getLikedVideos(userId: number, query: GetLikedVideosDto) {
        const { page = 1, limit = 10 } = query;
        const offset = (page - 1) * limit;

        // Lấy danh sách video IDs đã liked từ Redis trước
        const redisKeys = await this.redisService.keys(`user:${userId}:likes:video:*`);
        const likedVideoIdsFromRedis = new Set<number>();
        
        for (const key of redisKeys) {
            const likeData = await this.redisService.getJson(key);
            if (likeData && likeData.is_liked === true) {
                likedVideoIdsFromRedis.add(Number(likeData.video_id));
            }
        }

        // Lấy tổng số video đã liked từ database để tính pagination
        const totalLikedVideos = await this.likeRepository.count({
            where: { user_id: userId }
        });

        // Lấy danh sách video IDs đã liked từ database với phân trang
        const likedVideosFromDb = await this.likeRepository.find({
            where: { user_id: userId },
            select: ['video_id'],
            skip: offset,
            take: limit,
            order: { video_id: 'DESC' }
        });

        const likedVideoIdsFromDb = likedVideosFromDb.map(like => like.video_id);
        
        // Kết hợp cả Redis và DB, loại bỏ trùng lặp
        const allLikedVideoIds = [...new Set([...likedVideoIdsFromRedis, ...likedVideoIdsFromDb])];
        
        if (allLikedVideoIds.length === 0) {
            return {
                data: [],
                total: totalLikedVideos,
                page,
                limit,
                message: 'No liked videos found'
            };
        }

        // Sử dụng Elasticsearch để lấy thông tin video
        const searchResult = await this.searchVideoService.searchVideosByIds(
            allLikedVideoIds,
            0,
            allLikedVideoIds.length
        );
        
        // Áp dụng phân trang cho kết quả cuối cùng
        const startIndex = 0; // Vì đã lấy đúng số lượng từ DB
        const endIndex = Math.min(startIndex + limit, searchResult.data.length);
        const paginatedVideos = searchResult.data.slice(startIndex, endIndex);
        
        const transformedData = (paginatedVideos as any[]).map((video) => ({
            id: video.id,
            title: video.title,
            image: video.image,
            path: video.path,
            thumbnail: video.image,
            author: video.user_fullname || 'Unknown',
            views: video.view,
            avatar: video.user_avatar,
            tags: video.tags,
            createdAt: formatDistance(video.createdAt, new Date(), { addSuffix: true, locale: vi })
        }));
        
        return {
            data: transformedData,
            total: totalLikedVideos,
            page,
            limit,
            message: 'Liked videos retrieved successfully'
        };
    }
}