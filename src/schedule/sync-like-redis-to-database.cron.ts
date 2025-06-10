import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { LikeService } from 'src/modules/backend/like/like.service';


@Injectable()
export class SyncLikeRedisToDatabaseCron {
    constructor(
        private readonly likeService: LikeService
    ) {}

    @Cron('*/10 * * * * *')  // Chạy mỗi 30 giây
    async handleSync() {
        try {
            await this.likeService.syncLikeRedisToDatabase();
        } catch (error) {
            console.error('Error syncing likes:', error);
        }
    }
} 