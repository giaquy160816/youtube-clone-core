import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { VideoCoreService } from '../../../shared/video/video-core.service';

@Injectable()
export class SyncViewsCron {
    constructor(
        private readonly videoCoreService: VideoCoreService
    ) { }

    // Chạy mỗi 1 phút
    @Cron('*/1 * * * *')    
    async handleSync() {
        await this.videoCoreService.syncViewsToDatabase();
    }
}