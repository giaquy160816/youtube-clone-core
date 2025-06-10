import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ChunkCleanupService } from './chunk-cleanup.cron';
import { SyncVideoRedisToDatabaseCron } from './sync-video-redis-to-database.cron';
import { SyncLikeRedisToDatabaseCron } from './sync-like-redis-to-database.cron';
import { VideoCoreModule } from 'src/modules/shared/video/video-core.module';
import { Like } from '../modules/backend/like/entities/like.entity';
import { LikeModule } from 'src/modules/backend/like/like.module';

@Module({
    imports: [
        ScheduleModule.forRoot(),
        TypeOrmModule.forFeature([Like]),
        VideoCoreModule,
        LikeModule
    ],
    providers: [
        ChunkCleanupService,
        SyncVideoRedisToDatabaseCron,
        SyncLikeRedisToDatabaseCron
    ],
})
export class AppScheduleModule {}