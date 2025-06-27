import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';
import { RedisModule } from 'src/service/redis/redis.module';
import { Video } from '../video/entities/video.entity';
import { SearchVideoService } from 'src/modules/shared/video/video-search.service';
import { CustomElasticsearchModule } from 'src/service/elasticsearch/elasticsearch.module';

@Module({
    imports: [TypeOrmModule.forFeature([Like, Video]), RedisModule, CustomElasticsearchModule],
    controllers: [LikeController],
    providers: [LikeService, SearchVideoService],
    exports: [LikeService]
})
export class LikeModule {}
