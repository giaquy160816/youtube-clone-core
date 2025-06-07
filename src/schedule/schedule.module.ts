import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ChunkCleanupService } from './chunk-cleanup.cron';
import { SyncVideoRedisToDatabaseCron } from './sync-video-redis-to-database.cron';
import { VideoCoreModule } from 'src/modules/shared/video/video-core.module';


@Module({
    imports: [
        ScheduleModule.forRoot(),
        VideoCoreModule
    ],
    providers: [
        ChunkCleanupService,
        SyncVideoRedisToDatabaseCron,
    ],
})
export class AppScheduleModule { }