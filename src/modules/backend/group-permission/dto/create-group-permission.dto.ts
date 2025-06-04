import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsArray, IsNumber } from 'class-validator';
import { ManyToMany, JoinTable } from 'typeorm';
import { Permission } from '../../permission/entities/permission.entity';

export class CreateGroupPermissionDto {
    @ApiProperty({ description: 'Tên nhóm quyền' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ description: 'Mô tả nhóm quyền', required: false })
    @IsOptional()
    @IsString()
    description?: string;

    @ApiProperty({ description: 'Danh sách ID quyền', type: [Number] })
    @IsNotEmpty()
    @IsArray()
    @IsNumber({}, { each: true })
    permissionIds: number[];

} 