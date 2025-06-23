import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlaylistVideo } from './entities/playlist-video.entity';
import { PlaylistVideoService } from './playlist-video.service';
import { PlaylistVideoController } from './playlist-video.controller';
import { Playlists } from './entities/playlist.entity';
import { Video } from '../video/entities/video.entity';

@Module({
    imports: [TypeOrmModule.forFeature([PlaylistVideo, Playlists, Video])],
    providers: [PlaylistVideoService],
    controllers: [PlaylistVideoController],
    exports: [PlaylistVideoService],
})
export class PlaylistVideoModule { } 