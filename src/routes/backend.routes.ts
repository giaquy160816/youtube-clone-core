import { Routes } from '@nestjs/core';
import { AuthModule } from '../modules/backend/auth/auth.module';
import { UserModule } from '../modules/backend/user/user.module';
import { PhotoModule } from '../modules/backend/photo/photo.module';
import { CategoryModule } from '../modules/backend/category/category.module';
import { ProductModule } from '../modules/backend/product/product.module';

export const backendRoutes: Routes = [
    { path: 'backend/auth', module: AuthModule },
    { path: 'backend/user', module: UserModule },
    { path: 'backend/photo', module: PhotoModule },
    { path: 'backend/category', module: CategoryModule },
    { path: 'backend/product', module: ProductModule },
];

export const backendModules = [
    AuthModule,
    UserModule,
    PhotoModule,
    CategoryModule,
    ProductModule,
];