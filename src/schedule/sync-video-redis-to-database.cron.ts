import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { VideoCoreService } from 'src/modules/shared/video/video-core.service';

@Injectable()
export class SyncVideoRedisToDatabaseCron {
    constructor(
        private readonly videoCoreService: VideoCoreService
    ) { }

    // @Cron('*/1 * * * *')    // 1phút chạy 1 lần
    @Cron('*/30 * * * * *')  // 30 giây chạy 1 lần
    async handleSync() {
        console.log('PID:', process.pid, new Date().toISOString(), 'Syncing data video redis to database...');
        await this.videoCoreService.syncViewsToDatabase();
    }
}