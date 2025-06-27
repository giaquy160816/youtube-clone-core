import { Controller, Post, Delete, Body, Param, Get, Request, BadRequestException, Query } from '@nestjs/common';
import { LikeService } from './like.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { GetLikedVideosDto } from './dto/get-liked-videos.dto';
import { LikedVideosResponseDto } from './dto/liked-videos-response.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody, ApiQuery } from '@nestjs/swagger';

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

    @Get('liked-videos')
    @ApiOperation({ 
        summary: 'Get liked videos', 
        description: 'Get paginated list of videos liked by the current user' 
    })
    @ApiQuery({
        name: 'page',
        description: 'Page number (starts from 1)',
        required: false,
        type: Number,
        example: 1
    })
    @ApiQuery({
        name: 'limit',
        description: 'Number of items per page',
        required: false,
        type: Number,
        example: 10
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Liked videos retrieved successfully.',
        type: LikedVideosResponseDto
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Invalid user id in token.' 
    })
    getLikedVideos(@Request() req, @Query() query: GetLikedVideosDto) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) {
            throw new BadRequestException('Invalid user id in token');
        }
        return this.likeService.getLikedVideos(userId, query);
    }
}