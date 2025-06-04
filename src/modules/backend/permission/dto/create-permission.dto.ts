import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePermissionDto {
    @ApiProperty({ 
        description: 'Tên quyền',
        example: 'User Management'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ 
        description: 'Role của quyền',
        example: 'admin'
    })
    @IsNotEmpty()
    @IsString()
    role: string;

    @ApiProperty({ 
        description: 'Mô tả quyền',
        required: false,
        example: 'Permission to manage users'
    })
    @IsOptional()
    @IsString()
    description?: string;
} 