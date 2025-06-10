import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeController } from './like.controller';
import { LikeService } from './like.service';
import { Like } from './entities/like.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Like])],
    controllers: [LikeController],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikeModule {}
