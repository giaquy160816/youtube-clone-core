import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGroupPermissionDto } from './dto/create-group-permission.dto';
import { UpdateGroupPermissionDto } from './dto/update-group-permission.dto';
import { GroupPermission } from './entities/group-permission.entity';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class GroupPermissionService {
    constructor(
        @InjectRepository(GroupPermission)
        private readonly groupPermissionRepository: Repository<GroupPermission>,
        private readonly permissionService: PermissionService,
    ) {}

    async create(createGroupPermissionDto: CreateGroupPermissionDto) {

        const { permissionIds, ...groupData } = createGroupPermissionDto;
        // Lấy danh sách permission từ DB
        const permissions = await this.permissionService.findByIds(permissionIds);
        
        const groupPermission = this.groupPermissionRepository.create({
            ...groupData,
            permissions,
        });

        await this.groupPermissionRepository.save(groupPermission);
        return {
            message: 'Tạo nhóm quyền thành công',
        }
    }

    async findAll(page: number = 1, limit: number = 10, q?: string) {
        const take = limit;
        const skip = (page - 1) * take;

        const query = this.groupPermissionRepository.createQueryBuilder('groupPermission');

        if (q) {
            query.where('groupPermission.name LIKE :q OR groupPermission.description LIKE :q', { q: `%${q}%` });
        }
        const [data, total] = await query.skip(skip).take(take).getManyAndCount();
        return {
            data,
            total,
            page,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }

    async findOne(id: number) {
        const groupPermission = await this.groupPermissionRepository.findOne({
            where: { id },
            relations: ['users']
        });
        if (!groupPermission) {
            throw new NotFoundException(`Group permission with ID ${id} not found`);
        }
        return groupPermission;
    }

    async update(id: number, updateGroupPermissionDto: UpdateGroupPermissionDto) {
        const { permissionIds, ...groupData } = updateGroupPermissionDto;
        const groupPermission = await this.findOne(id);

        if (permissionIds) {
            const permissions = await this.permissionService.findByIds(permissionIds);
            groupPermission.permissions = permissions;
        }

        Object.assign(groupPermission, groupData);
        await this.groupPermissionRepository.save(groupPermission);
        return {
            message: 'Cập nhật nhóm quyền thành công',
        }
    }

    async remove(id: number) {
        const groupPermission = await this.findOne(id);
        return await this.groupPermissionRepository.remove(groupPermission);
    }
} 