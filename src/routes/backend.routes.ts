import { Routes } from '@nestjs/core';
import { AuthModule } from 'src/modules/backend/auth/auth.module';
import { UserModule } from 'src/modules/backend/user/user.module';
import { VideoModule } from 'src/modules/backend/video/video.module';
import { SettingModule } from 'src/modules/backend/setting/setting.module';
import { CommonModule } from 'src/modules/backend/common/common.module';
import { AppScheduleModule } from 'src/schedule/schedule.module';
import { LikeModule } from 'src/modules/backend/like/like.module';
import { WatchedModule } from 'src/modules/backend/watched/watched.module';
import { PlaylistVideoModule } from 'src/modules/backend/playlists/playlist-video.module';
import { PlaylistsModule } from 'src/modules/backend/playlists/playlists.module';


export const backendRoutes: Routes = [
    { path: 'backend/user', module: UserModule },
    { path: 'backend/auth', module: AuthModule },
    { path: 'backend/video', module: VideoModule },
    { path: 'backend/common', module: CommonModule },
    { path: 'backend/like', module: LikeModule },
    { path: 'backend/watched', module: WatchedModule },
    { path: 'backend/playlists', module: PlaylistsModule },
    { path: 'backend/playlist-video', module: PlaylistVideoModule },
    { path: 'backend/setting', module: SettingModule },
];

export const backendModules = [
    AuthModule,
    UserModule,
    CommonModule,
    VideoModule,
    AppScheduleModule,
    LikeModule,
    WatchedModule,
    PlaylistsModule,
    PlaylistVideoModule,
    SettingModule,
];