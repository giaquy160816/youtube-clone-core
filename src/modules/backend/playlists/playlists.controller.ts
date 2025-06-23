import { Controller, Post, Patch, Get, Delete, Param, Body, Req, Request } from '@nestjs/common';
import { PlaylistsService } from './playlists.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { ApiTags, ApiBearerAuth, ApiBody } from '@nestjs/swagger';

@ApiTags('Backend / Playlists')
@ApiBearerAuth('access_token')
@Controller()
export class PlaylistsController {
    constructor(private readonly playlistsService: PlaylistsService) { }

    @Post()
    @ApiBody({ type: CreatePlaylistDto, examples: { example1: { value: { name: 'My Playlist', description: 'This is my favorite playlist' } } } })
    create(@Body() dto: CreatePlaylistDto, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) throw new Error('Invalid user id in token');
        return this.playlistsService.create(dto, userId);
    }

    @Patch(':id')
    @ApiBody({ type: UpdatePlaylistDto, examples: { example1: { value: { name: 'My Updated Playlist', description: 'Updated description' } } } })
    update(@Param('id') id: string, @Body() dto: UpdatePlaylistDto, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) throw new Error('Invalid user id in token');
        return this.playlistsService.update(Number(id), dto, userId);
    }

    @Get(':id')
    findOne(@Param('id') id: string, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) throw new Error('Invalid user id in token');
        return this.playlistsService.findOne(Number(id), userId);
    }

    @Get()
    findAll(@Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) throw new Error('Invalid user id in token');
        return this.playlistsService.findAll({ id: userId } as any);
    }

    @Delete(':id')
    remove(@Param('id') id: string, @Request() req) {
        const userId = Number(req.user?.sub);
        if (!userId || isNaN(userId)) throw new Error('Invalid user id in token');
        return this.playlistsService.remove(Number(id), { id: userId } as any);
    }
} 