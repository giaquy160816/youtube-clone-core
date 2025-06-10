import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader, ApiQuery, ApiExcludeController } from '@nestjs/swagger';

@ApiTags('Backend / Permission')
@ApiBearerAuth('access_token') 
@ApiExcludeController()
@Controller()
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Post()
    @ApiOperation({ summary: 'Tạo quyền mới' })
    @ApiResponse({ status: 201, description: 'Tạo quyền thành công' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createPermissionDto: CreatePermissionDto) {
        return this.permissionService.create(createPermissionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách quyền' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách quyền thành công' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiQuery({ name: 'parent', required: false, type: Number })
    findAll(@Query('parent') parent?: number) {
        return this.permissionService.findAll(parent !== undefined ? Number(parent) : undefined);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin quyền theo ID' })
    @ApiResponse({ status: 200, description: 'Lấy thông tin quyền thành công' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy quyền' })
    findOne(@Param('id') id: string) {
        return this.permissionService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật quyền' })
    @ApiResponse({ status: 200, description: 'Cập nhật quyền thành công' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy quyền' })
    update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
        return this.permissionService.update(id, updatePermissionDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa quyền' })
    @ApiResponse({ status: 200, description: 'Xóa quyền thành công' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy quyền' })
    remove(@Param('id') id: string) {
        return this.permissionService.remove(id);
    }
} 