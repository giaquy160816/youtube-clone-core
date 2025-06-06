import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Injectable()
export class PermissionService {
    constructor(
        @InjectRepository(Permission)
        private permissionRepository: Repository<Permission>,
    ) {}

    async create(createPermissionDto: CreatePermissionDto) {
        const permissionExist = await this.permissionRepository.findOne({
            where: { role: createPermissionDto.role }
        });
        if (permissionExist) {
            throw new BadRequestException('Permission already exists');
        }
        const permission = this.permissionRepository.create(createPermissionDto);
        await this.permissionRepository.save(permission);
        return{
            message: 'Permission created successfully',
        }
    }

    async findAll(parent?: number) {
        let permissions: Permission[];

        if (parent !== undefined && parent !== null) {
            // Lấy permission có id = parent và các permission có parent = parent
            permissions = await this.permissionRepository.find({
                where: [
                    { id: String(parent) },
                    { parent: parent }
                ],
                order: { id: 'ASC' }
            });
        } else {
            // Lấy tất cả
            permissions = await this.permissionRepository.find({
                order: { id: 'ASC' }
            });
        }

        // Nhóm theo parent
        const groupMap: Record<number, any> = {};
        permissions.forEach(item => {
            if (item.parent === 0 || item.parent === null) {
                groupMap[item.id] = { ...item, children: [] };
            }
        });
        permissions.forEach(item => {
            if (item.parent && groupMap[item.parent]) {
                groupMap[item.parent].children.push(item);
            }
        });

        // Nếu truyền parent, chỉ trả về nhóm đó; nếu không, trả về tất cả nhóm cha
        if (parent !== undefined && parent !== null) {
            return Object.values(groupMap);
        } else {
            return Object.values(groupMap);
        }
    }

    async findOne(id: string) {
        const permission = await this.permissionRepository.findOne({
            where: { id },
            relations: ['groupPermissions']
        });
        if (!permission) {
            throw new NotFoundException(`Permission with ID ${id} not found`);
        }
        return permission;
    }

    async findByIds(ids: number[]) {
        return await this.permissionRepository.find({
            where: { id: In(ids) },
        });
    }

    async update(id: string, updatePermissionDto: UpdatePermissionDto) {
        if (updatePermissionDto.role) {
            const permissionExist = await this.permissionRepository.findOne({
                where: { role: updatePermissionDto.role }
            });
            if (permissionExist && permissionExist.id !== id) {
                throw new BadRequestException('Permission already exists');
            }
        }
        const permission = await this.findOne(id);
        Object.assign(permission, updatePermissionDto);
        await this.permissionRepository.save(permission);
        return {
            message: 'Permission updated successfully',
        }
    }

    async remove(id: string) {
        const permission = await this.findOne(id);
        await this.permissionRepository.remove(permission);
        return {
            message: 'Permission deleted successfully',
        }
    }
} 