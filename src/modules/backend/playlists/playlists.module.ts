import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Playlists } from './entities/playlist.entity';
import { PlaylistsService } from './playlists.service';
import { PlaylistsController } from './playlists.controller';
import { User } from '../user/entities/user.entity';
import { PlaylistVideo } from './entities/playlist-video.entity';
import { PlaylistVideoService } from './playlist-video.service';

@Module({
  imports: [TypeOrmModule.forFeature([Playlists, User, PlaylistVideo])],
  providers: [PlaylistsService],
  controllers: [PlaylistsController],
  exports: [PlaylistsService],
})
export class PlaylistsModule {} 