import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Video } from 'src/modules/backend/video/entities/video.entity';
import { VideoCoreModule } from 'src/modules/shared/video/video-core.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Video]),
        VideoCoreModule
    ],
    controllers: [VideoController],
    providers: [VideoService],
})
export class VideoModule { }
