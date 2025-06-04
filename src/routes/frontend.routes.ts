import { Routes } from '@nestjs/core';
import { HomeModule } from 'src/modules/frontend/home/home.module';
import { VideoModule } from 'src/modules/frontend/video/video.module';


export const frontendRoutes: Routes = [
    { path: 'home', module: HomeModule },
    { path: 'video', module: VideoModule },
];

export const frontendModules = [
    HomeModule,
    VideoModule,
];