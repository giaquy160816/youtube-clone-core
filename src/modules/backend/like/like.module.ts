import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';
import { RedisModule } from 'src/service/redis/redis.module';
import { Video } from '../video/entities/video.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Like, Video]), RedisModule],
    controllers: [LikeController],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikeModule {}
