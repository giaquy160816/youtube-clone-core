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


    @Delete(':id/:videoId')
    remove(@Param('id') id: string, @Param('videoId') videoId: string, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) throw new Error('Invalid user id in token');
        return this.playlistVideoService.remove(Number(id), Number(videoId), userId);
    }
} 