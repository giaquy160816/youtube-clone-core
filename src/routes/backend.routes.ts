import { Routes } from '@nestjs/core';
import { AuthModule } from 'src/modules/backend/auth/auth.module';
import { UserModule } from 'src/modules/backend/user/user.module';
import { VideoModule } from 'src/modules/backend/video/video.module';
import { SettingModule } from 'src/modules/backend/setting/setting.module';
import { TokenModule } from 'src/modules/backend/token/token.module';
import { CommonModule } from 'src/modules/backend/common/common.module';

export const backendRoutes: Routes = [
    { path: 'backend/auth', module: AuthModule },
    { path: 'backend/user', module: UserModule },
    { path: 'backend/video', module: VideoModule },
    { path: 'backend/setting', module: SettingModule },
    { path: 'backend/token', module: TokenModule },
    { path: 'backend/common', module: CommonModule },
];

export const backendModules = [
    AuthModule,
    UserModule,
    VideoModule,
    SettingModule,
    TokenModule,
    CommonModule,
];