import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';
import { RedisModule } from 'src/service/redis/redis.module';

@Module({
    imports: [TypeOrmModule.forFeature([Like]), RedisModule],
    controllers: [LikeController],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikeModule {}
