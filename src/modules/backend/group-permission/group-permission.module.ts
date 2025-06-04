import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupPermission } from './entities/group-permission.entity';
import { GroupPermissionController } from './group-permission.controller';
import { GroupPermissionService } from './group-permission.service';
import { PermissionModule } from '../permission/permission.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([GroupPermission]),
        PermissionModule,
    ],
    controllers: [GroupPermissionController],
    providers: [GroupPermissionService],
})
export class GroupPermissionModule { }