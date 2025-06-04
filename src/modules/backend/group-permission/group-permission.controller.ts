import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { GroupPermissionService } from './group-permission.service';
import { CreateGroupPermissionDto } from './dto/create-group-permission.dto';
import { UpdateGroupPermissionDto } from './dto/update-group-permission.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('Backend / GroupPermission')
@ApiBearerAuth('access_token') 
@Controller()
export class GroupPermissionController {
    constructor(
        private readonly groupPermissionService: GroupPermissionService,
    ) {}

    @Post()
    @ApiOperation({ summary: 'Tạo nhóm quyền mới' })
    @ApiResponse({ status: 201, description: 'Tạo nhóm quyền thành công' })
    create(@Body() createGroupPermissionDto: CreateGroupPermissionDto) {
        return this.groupPermissionService.create(createGroupPermissionDto);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách nhóm quyền' })
    @ApiResponse({ status: 200, description: 'Lấy danh sách nhóm quyền thành công' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'q', required: false, type: String })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('q') q?: string
    ) {
        const pageNum = page ? Number(page) : 1;
        const limitNum = limit ? Number(limit) : 10;
        return this.groupPermissionService.findAll(pageNum, limitNum, q);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin nhóm quyền theo ID' })
    @ApiResponse({ status: 200, description: 'Lấy thông tin nhóm quyền thành công' })
    findOne(@Param('id') id: number) {
        return this.groupPermissionService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Cập nhật nhóm quyền' })
    @ApiResponse({ status: 200, description: 'Cập nhật nhóm quyền thành công' })
    update(@Param('id') id: number, @Body() updateGroupPermissionDto: UpdateGroupPermissionDto) {
        return this.groupPermissionService.update(id, updateGroupPermissionDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa nhóm quyền' })
    @ApiResponse({ status: 200, description: 'Xóa nhóm quyền thành công' })
    remove(@Param('id') id: number) {
        return this.groupPermissionService.remove(id);
    }
} 