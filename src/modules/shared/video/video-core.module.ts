// src/modules/shared/video/video-core.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from 'src/modules/backend/video/entities/video.entity';
import { VideoCoreService } from './video-core.service';
import { SearchVideoService } from './video-search.service';
import { CustomElasticsearchModule } from 'src/service/elasticsearch/elasticsearch.module';
import { RedisModule } from 'src/service/redis/redis.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Video]),
        CustomElasticsearchModule,
        RedisModule
    ],
    providers: [VideoCoreService, SearchVideoService],
    exports: [VideoCoreService],
})
export class VideoCoreModule { }