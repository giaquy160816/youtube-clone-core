import { Controller, Post, Delete, Body, Param, Get, Request, BadRequestException } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Backend / Likes')
@ApiBearerAuth('access_token') 
@Controller()
export class LikeController {
    constructor(private readonly likeService: LikeService) {}

    @Post()
    @ApiOperation({ 
        summary: 'Like video', 
        description: 'Create a new like for a video' 
    })
    @ApiBody({
        type: CreateLikeDto,
        description: 'Video ID to like',
        examples: {
            example1: {
                value: {
                    video_id: 1
                },
                summary: 'Like video with ID 1'
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Like created successfully.',
        type: CreateLikeDto 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid data or user already liked this video.' 
    })
    create(@Request() req, @Body() dto: CreateLikeDto) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.likeService.create(dto, userId);
    }

    @Delete(':videoId')
    @ApiOperation({ 
        summary: 'Unlike video', 
        description: 'Remove a like for a video' 
    })
    @ApiParam({ 
        name: 'videoId', 
        description: 'ID of the video to unlike',
        required: true,
        type: Number,
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Like removed successfully.' 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Like not found.' 
    })
    remove(@Request() req, @Param('videoId') videoId: string) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.likeService.remove(+videoId, userId);
    }

    @Get('check/:videoId')
    @ApiOperation({ 
        summary: 'Check if video is liked', 
        description: 'Check if the current user has liked a specific video' 
    })
    @ApiParam({ 
        name: 'videoId', 
        description: 'ID of the video to check',
        required: true,
        type: Number,
        example: 1
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Returns whether the video is liked by the user.',
        type: Boolean,
        examples: {
            example1: {
                value: true,
                summary: 'Video is liked'
            },
            example2: {
                value: false,
                summary: 'Video is not liked'
            }
        }
    })
    checkLike(@Request() req, @Param('videoId') videoId: string) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.likeService.checkLike(userId, +videoId);
    }
}