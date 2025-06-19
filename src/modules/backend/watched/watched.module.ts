import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchedController } from './watched.controller';
import { WatchedService } from './watched.service';
import { Watched } from './entities/watched.entity';
import { RedisModule } from 'src/service/redis/redis.module';
import { Video } from '../video/entities/video.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Watched, Video]), RedisModule],
    controllers: [WatchedController],
    providers: [WatchedService],
    exports: [WatchedService]
})
export class WatchedModule {}
