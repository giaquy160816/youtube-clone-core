import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
    Delete,
    Query,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoService } from './video.service';
import { VideoUploadService } from './video-upload.service';
import { ApiTags, ApiResponse, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger';


@ApiTags('Backend / Video')
@ApiBearerAuth('access_token') 
@Controller()
export class VideoController {
    constructor(
        private readonly videoService: VideoService,
        private readonly videoUploadService: VideoUploadService,
    ) { }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload video file' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'File video cần upload (chỉ hỗ trợ định dạng mp4)'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Upload thành công',
        schema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    example: '/uploads/videos/example.mp4',
                    description: 'Đường dẫn đến file video đã upload'
                }
            }
        }
    })
    async uploadVideo(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        
        const filePath = await this.videoUploadService.uploadVideo(file);
        return {
            path: filePath
        };
    }
    
    @Post('reindex')
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
    delete(@Param('id') id: number) {
        return this.videoService.delete(id);
    }
}