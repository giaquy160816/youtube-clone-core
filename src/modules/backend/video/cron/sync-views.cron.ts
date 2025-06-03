import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { VideoService } from 'src/modules/backend/video/video.service';

@Injectable()
export class SyncViewsCron {
    constructor(private readonly videoService: VideoService) { }

    // Chạy mỗi 1 phút
    @Cron('*/1 * * * *')    
    async handleSync() {
        await this.videoService.syncViewsToDatabase();
    }
}