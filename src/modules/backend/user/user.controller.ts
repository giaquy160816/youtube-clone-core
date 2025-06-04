import { Controller, Get, Body, Param, Query, Put, Request, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateUserDto, UpdateMeUserDto } from './dto/update-user.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';

@ApiTags('Backend / User')
@ApiBearerAuth('access_token') 
@Controller()
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Put('me')
    @ApiOperation({ summary: 'Cập nhật thông tin user hiện tại' })
    @ApiBody({
        type: UpdateMeUserDto,
        description: 'Chỉ được phép cập nhật fullname, phone, avatar. Email không được phép thay đổi.',
        examples: {
            example1: {
                value: {
                    fullname: 'Nguyen Van A',
                    phone: '0123456789',
                    avatar: 'https://example.com/avatar.jpg'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cập nhật user thành công', 
        schema: {
            example: { 
                message: 'User updated successfully',
                data: {
                    id: 1,
                    fullname: 'Nguyen Van A',
                    phone: '0123456789',
                    avatar: 'https://example.com/avatar.jpg',
                    email: 'user@example.com',
                    createdAt: '2024-03-20T10:00:00Z',
                    updatedAt: '2024-03-20T10:00:00Z'
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid user id in token' })
    updateMe(@Request() req, @Body() updateUserDto: UpdateMeUserDto) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.userService.updateMe(userId, updateUserDto);
    }

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật thông tin user' })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'ID của user cần cập nhật',
        example: 1
    })
    @ApiBody({
        type: UpdateUserDto,
        description: 'Thông tin cần cập nhật cho user. Email không được phép thay đổi.',
        examples: {
            example1: {
                value: {
                    fullname: 'Nguyen Van A',
                    phone: '0123456789',
                    avatar: 'https://example.com/avatar.jpg',
                    isActive: true,
                    groupPermission: [1, 2, 3]
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cập nhật user thành công',
        schema: {
            example: {
                id: 1,
                fullname: 'Nguyen Van A',
                phone: '0123456789',
                avatar: 'https://example.com/avatar.jpg',
                email: 'user@example.com',
                status: 'active',
                groupPermission: [1, 2, 3],
                createdAt: '2024-03-20T10:00:00Z',
                updatedAt: '2024-03-20T10:00:00Z'
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    update(@Param('id') id: number, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Lấy thông tin user hiện tại' })
    @ApiResponse({ 
        status: 200, 
        description: 'Thông tin user hiện tại',
        schema: {
            example: {
                id: 1,
                fullname: 'Nguyen Van A',
                phone: '0123456789',
                avatar: 'https://example.com/avatar.jpg',
                email: 'user@example.com',
                status: 'active',
                createdAt: '2024-03-20T10:00:00Z',
                updatedAt: '2024-03-20T10:00:00Z'
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid user id in token' })
    findMe(@Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.userService.findOne(userId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy thông tin user theo ID' })
    @ApiParam({ 
        name: 'id', 
        type: 'number', 
        description: 'ID của user cần lấy thông tin',
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Thông tin user',
        schema: {
            example: {
                id: 1,
                fullname: 'Nguyen Van A',
                phone: '0123456789',
                avatar: 'https://example.com/avatar.jpg',
                email: 'user@example.com',
                status: 'active',
                createdAt: '2024-03-20T10:00:00Z',
                updatedAt: '2024-03-20T10:00:00Z'
            }
        }
    })
    @ApiResponse({ status: 404, description: 'User not found' })
    findOne(@Param('id') id: number): Promise<User> {
        return this.userService.findOne(id);
    }

    @Get()
    @ApiOperation({ summary: 'Tìm kiếm user' })
    @ApiResponse({ 
        status: 200, 
        description: 'Danh sách user',
        schema: {
            example: {
                items: [
                    {
                        id: 1,
                        fullname: 'Nguyen Van A',
                        phone: '0123456789',
                        avatar: 'https://example.com/avatar.jpg',
                        email: 'user@example.com',
                        status: 'active',
                        createdAt: '2024-03-20T10:00:00Z',
                        updatedAt: '2024-03-20T10:00:00Z'
                    }
                ],
                meta: {
                    total: 1,
                    page: 1,
                    limit: 10,
                    totalPages: 1
                }
            }
        }
    })
    @ApiQuery({ 
        name: 'q', 
        required: false, 
        type: String,
        description: 'Từ khóa tìm kiếm (tên, email, số điện thoại)',
        example: 'nguyen'
    })
    @ApiQuery({ 
        name: 'page', 
        required: false, 
        type: Number,
        description: 'Số trang',
        example: 1
    })
    @ApiQuery({ 
        name: 'limit', 
        required: false, 
        type: Number,
        description: 'Số lượng item trên mỗi trang',
        example: 10
    })
    findAll(
        @Query('q') q?: string,
        @Query('page') page?: number,
        @Query('limit') limit?: number
    ) {
        const pageNum = page ? Number(page) : 1;
        const limitNum = limit ? Number(limit) : 10;
        return this.userService.findAll(q, pageNum, limitNum);
    }
}
