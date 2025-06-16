import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
    Delete,
    Query,
    BadRequestException,
    Request,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoService } from './video.service';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiBearerAuth, ApiExcludeEndpoint } from '@nestjs/swagger';


@ApiTags('Backend / Video')
@ApiBearerAuth('access_token') 
@Controller()
export class VideoController {
    constructor(
        private readonly videoService: VideoService,
    ) { }
    
    @Post('reindex')
    @ApiExcludeEndpoint ()
    @ApiOperation({ summary: 'Cập nhật toàn bộ video từ DB vào ES' })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật thành công',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Reindex all videos to ES successfully'
                },
                videos: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            title: { type: 'string', example: 'Video Title' },
                            description: { type: 'string', example: 'Video Description' },
                            image: { type: 'string', example: '/uploads/images/example.jpg' },
                            path: { type: 'string', example: '/uploads/videos/example.mp4' },
                            view: { type: 'number', example: 0 },
                            user_id: { type: 'number', example: 1 },
                            user_fullname: { type: 'string', example: 'John Doe' },
                            user_avatar: { type: 'string', example: '/uploads/avatars/example.jpg' },
                            createdAt: { type: 'string', example: '2024-03-20T10:00:00Z' }
                        }
                    }
                }
            }
        }
    })
    async reindexAll() {
        return this.videoService.reindexAllToES();
    }

    @Post()
    @ApiOperation({ summary: 'Tạo video mới' })
    @ApiBody({
        schema: {
            type: 'object',
            required: ['title'],
            properties: {
                title: {
                    type: 'string',
                    example: 'Video Title',
                    description: 'Tiêu đề video'
                },
                description: {
                    type: 'string',
                    example: 'Video Description',
                    description: 'Mô tả video'
                },
                image: {
                    type: 'string',
                    example: '/uploads/images/example.jpg',
                    description: 'Đường dẫn ảnh thumbnail'
                },
                path: {
                    type: 'string',
                    example: '/uploads/videos/example.mp4',
                    description: 'Đường dẫn file video'
                },
                isActive: {
                    type: 'boolean',
                    example: true,
                    description: 'Trạng thái video (true: hiển thị, false: ẩn)'
                },
                tags: {
                    type: 'array',
                    example: ['tag1', 'tag2'],
                    description: 'Tags của video'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Tạo video thành công',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Video created successfully'
                },
                result: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        title: { type: 'string', example: 'Video Title' },
                        description: { type: 'string', example: 'Video Description' },
                        image: { type: 'string', example: '/uploads/images/example.jpg' },
                        path: { type: 'string', example: '/uploads/videos/example.mp4' },
                        view: { type: 'number', example: 0 },
                        user_id: { type: 'number', example: 1 },
                        user_fullname: { type: 'string', example: 'John Doe' },
                        user_avatar: { type: 'string', example: '/uploads/avatars/example.jpg' },
                        tags: { type: 'array', example: ['tag1', 'tag2'] },
                        createdAt: { type: 'string', example: '2024-03-20T10:00:00Z' }
                    }
                }
            }
        }
    })
    create(@Request() req, @Body() createVideoDto: CreateVideoDto) {
        console.log('req.user', req.user);
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.videoService.create(createVideoDto, userId);
    }
    

    @Put(':id')
    @ApiOperation({ summary: 'Cập nhật video' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                title: {
                    type: 'string',
                    example: 'Updated Video Title',
                    description: 'Tiêu đề video mới'
                },
                description: {
                    type: 'string',
                    example: 'Updated Video Description',
                    description: 'Mô tả video mới'
                },
                image: {
                    type: 'string',
                    example: '/uploads/images/updated.jpg',
                    description: 'Đường dẫn ảnh thumbnail mới'
                },
                path: {
                    type: 'string',
                    example: '/uploads/videos/updated.mp4',
                    description: 'Đường dẫn file video mới'
                },
                isActive: {
                    type: 'boolean',
                    example: true,
                    description: 'Trạng thái video mới'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Cập nhật video thành công',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Video updated successfully'
                }
            }
        }
    })
    update(@Param('id') id: number, @Body() updateVideoDto: UpdateVideoDto) {
        return this.videoService.update(id, updateVideoDto);
    }

    @Get('me')
    @ApiOperation({ summary: 'Tìm kiếm video' })
    @ApiResponse({
        status: 200,
        description: 'Tìm kiếm video thành công',
    })
    findAllByUserId(@Request() req, @Query('page') page: number = 1, @Query('limit') limit: number = 10) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.videoService.findAllByUserId(userId, Number(page), Number(limit));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Lấy video theo id' })
    @ApiResponse({
        status: 200,
        description: 'Lấy video theo id thành công',
    })
    findById(@Param('id') id: number) {
        return this.videoService.findById(id);
    }

    @Get()
    @ApiOperation({ summary: 'Lấy danh sách video' })
    @ApiResponse({
        status: 200,
        description: 'Lấy danh sách video thành công',
        schema: {
            type: 'object',
            properties: {
                data: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            id: { type: 'number', example: 1 },
                            title: { type: 'string', example: 'Video Title' },
                            description: { type: 'string', example: 'Video Description' },
                            image: { type: 'string', example: '/uploads/images/example.jpg' },
                            path: { type: 'string', example: '/uploads/videos/example.mp4' },
                            view: { type: 'number', example: 0 },
                            user: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number', example: 1 },
                                    fullname: { type: 'string', example: 'John Doe' },
                                    avatar: { type: 'string', example: '/uploads/avatars/example.jpg' }
                                }
                            }
                        }
                    }
                },
                total: { type: 'number', example: 100 },
                page: { type: 'number', example: 1 },
                limit: { type: 'number', example: 10 }
            }
        }
    })
    findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 2) {
        return this.videoService.findAll(Number(page), Number(limit));
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Xóa video' })
    @ApiResponse({
        status: 200,
        description: 'Xóa video thành công',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Video deleted successfully'
                }
            }
        }
    })
    delete(@Param('id') id: number, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.videoService.delete(id, userId);
    }
}