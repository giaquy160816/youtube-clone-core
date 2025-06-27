import { Controller, Post, Get, Patch, Delete, Param, Body, Request } from '@nestjs/common';
import { PlaylistVideoService } from './playlist-video.service';
import { CreatePlaylistVideoDto } from './dto/create-playlist-video.dto';
import { UpdatePlaylistVideoDto } from './dto/update-playlist-video.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Backend / Playlist Video')
@ApiBearerAuth('access_token') 
@Controller()
export class PlaylistVideoController {
    constructor(private readonly playlistVideoService: PlaylistVideoService) { }

    @Post()
    create(@Body() dto: CreatePlaylistVideoDto, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) throw new Error('Invalid user id in token');
        return this.playlistVideoService.create(dto, userId);
    }

    @Get('video/:videoId')
    @ApiOperation({ summary: 'Get playlists where a video has been saved' })
    @ApiParam({ name: 'videoId', description: 'ID of the video' })
    @ApiResponse({ status: 200, description: 'List of playlists containing the video' })
    @ApiResponse({ status: 400, description: 'Invalid video ID' })
    getPlaylistsByVideoId(@Param('videoId') videoId: string, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) throw new Error('Invalid user id in token');
        
        const videoIdNum = Number(videoId);
        if (!videoIdNum || isNaN(videoIdNum)) throw new Error('Invalid video ID');
        
        return this.playlistVideoService.getPlaylistsByVideoId(videoIdNum, userId);
    }

    @Delete(':id/:videoId')
    remove(@Param('id') id: string, @Param('videoId') videoId: string, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) throw new Error('Invalid user id in token');
        return this.playlistVideoService.remove(Number(id), Number(videoId), userId);
    }
    
} 