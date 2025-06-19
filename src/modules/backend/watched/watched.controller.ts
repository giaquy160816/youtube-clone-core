import { Controller, Post, Delete, Body, Param, Get, Request, BadRequestException, Query } from '@nestjs/common';
import { WatchedService } from './watched.service';
import { CreateWatchedDto } from './dto/create-watched.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Backend / Watcheds')
@ApiBearerAuth('access_token') 
@Controller()
export class WatchedController {
    constructor(private readonly watchedService: WatchedService) {}

    @Post()
    @ApiOperation({ summary: 'Lưu video đã xem' })
    @ApiBody({ 
        type: CreateWatchedDto,
        description: 'ID video đã xem',
        examples: {
            example1: {
                value: { id: 1 },
                summary: 'Lưu video đã xem với ID 1'
            }
        }
    })
    @ApiResponse({ status: 201, description: 'Lưu thành công' })
    async create(
        @Request() req,
        @Body() createWatchedDto: CreateWatchedDto
    ) {
        const userId = Number(req.user?.sub);
        if (!userId) throw new BadRequestException('Invalid user id in token');
        return this.watchedService.create(userId, createWatchedDto.id);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách video đã xem của user' })
    @ApiResponse({ status: 200, description: 'Danh sách video đã xem' })
    // thêm phân trang và query search mặc định page = 1, limit = 10
    async getAll(@Request() req, @Query('page') page: number, @Query('limit') limit: number) {
        const userId = Number(req.user?.sub);
        if (!userId) throw new BadRequestException('Invalid user id in token');
        return this.watchedService.getAllByUserId(userId, page, limit);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa video đã xem khỏi danh sách' })
    @ApiParam({ name: 'id', type: Number, description: 'ID video đã xem' })
    @ApiResponse({ status: 200, description: 'Xóa thành công' })
    @ApiResponse({ status: 404, description: 'Không tìm thấy hoặc không có quyền' })
    async delete(
        @Request() req,
        @Param('id') id: number
    ) {
        const userId = Number(req.user?.sub);
        if (!userId) throw new BadRequestException('Invalid user id in token');
        return this.watchedService.delete(userId, id);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Check if video is watched', 
        description: 'Check if the current user has watched a specific video' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns whether the video is watched by the user.',
        type: Boolean,
        examples: {
            example1: {
                value: true,
                summary: 'Video is watched'
            },
            example2: {
                value: false,
                summary: 'Video is not watched'
            }
        }
    })
    checkWatched(@Request() req, @Param('id') id : number) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.watchedService.checkWatched(userId, id);
    }
}