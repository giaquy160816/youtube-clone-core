import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Like } from './entities/like.entity';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';

@Injectable()
export class LikeService {
    constructor(
        @InjectRepository(Like)
        private readonly likeRepository: Repository<Like>,
    ) { }

    async create(dto: CreateLikeDto, userId: number): Promise<any> {
        // Check if user already liked this video
        const existingLike = await this.likeRepository.findOne({
            where: { user_id: userId, video_id: dto.video_id }
        });

        if (existingLike) {
            throw new HttpException('User already liked this video', HttpStatus.BAD_REQUEST);
        }

        const like = this.likeRepository.create({
            user_id: userId,
            video_id: dto.video_id
        });
        await this.likeRepository.save(like);
        return {
            message: 'Like created successfully'
        };
    }

    async remove(videoId: number, userId: number): Promise<void> {
        const result = await this.likeRepository.delete({
            video_id: videoId,
            user_id: userId
        });
        
        if (result.affected === 0) {
            throw new NotFoundException('Like not found');
        }
    }

    async checkLike(userId: number, videoId: number): Promise<any> {
        const like = await this.likeRepository.findOne({
            where: { user_id: userId, video_id: videoId }
        });
        return {
            isLiked: !!like,
            message: 'Like checked successfully'
        };
    }
}