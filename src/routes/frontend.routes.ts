import { Routes } from '@nestjs/core';
import { HomeModule } from '../modules/frontend/home/home.module';

export const frontendRoutes: Routes = [
    { path: 'home', module: HomeModule },
];

export const frontendModules = [HomeModule];