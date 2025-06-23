import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Playlists } from './entities/playlist.entity';
import { CreatePlaylistDto } from './dto/create-playlist.dto';
import { UpdatePlaylistDto } from './dto/update-playlist.dto';
import { User } from '../user/entities/user.entity';
import { PlaylistVideoService } from './playlist-video.service';
import { PlaylistVideo } from './entities/playlist-video.entity';

@Injectable()
export class PlaylistsService {
    constructor(
        @InjectRepository(Playlists)
        private readonly playlistsRepository: Repository<Playlists>,

        @InjectRepository(User)
        private readonly userRepository: Repository<User>,

        @InjectRepository(PlaylistVideo)
        private readonly playlistVideoRepository: Repository<PlaylistVideo>,
    ) { }

    async create(createDto: CreatePlaylistDto, userId: number) {
        const user = await this.userRepository.findOne(
            { where: { id: userId } }
        );
        if (!user) throw new HttpException('User not found', HttpStatus.NOT_FOUND);

        const playlist = this.playlistsRepository.create(
            { ...createDto, user }
        );
        this.playlistsRepository.save(playlist);
        return {
            message: 'Playlist created successfully',
        }
    }

    async update(id: number, updateDto: UpdatePlaylistDto, userId: number) {
        const playlist = await this.playlistsRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!playlist || playlist.user.id !== userId) {
            throw new HttpException('Playlist not found or not owned by user 11', HttpStatus.NOT_FOUND);
        }
        Object.assign(playlist, updateDto);
        this.playlistsRepository.save(playlist);
        return {
            message: 'Playlist updated successfully',
        }
    }

    async findOne(id: number, userId: number) {
        const playlist = await this.playlistsRepository.findOne({ 
            where: { id }, 
            relations: ['playlistVideos', 'playlistVideos.video', 'user'] 
        });
        if (!playlist) throw new HttpException('Playlist not found or not owned by user', HttpStatus.NOT_FOUND);

        if (playlist.user.id !== userId) {
            throw new HttpException('Playlist not found or not owned by user', HttpStatus.NOT_FOUND);
        }
        const infoPlaylist = {
            id: playlist.id,
            name: playlist.name,
            videos: playlist.playlistVideos.map((playlistVideo) => {
                return {
                    id: playlistVideo.video.id,
                    title: playlistVideo.video.title,
                    image: playlistVideo.video.image,
                    path: playlistVideo.video.path,
                    view: playlistVideo.video.view,
                }
            }),
        }

        return {
            message: 'Playlist fetched successfully',
            data: infoPlaylist,
        }
    }

    async findAll(user: User) {
        const playlists = await this.playlistsRepository.find({
            where: { user: { id: user.id } },
            relations: ['playlistVideos', 'playlistVideos.video'],
            order: { id: 'DESC' },
        });
        return {
            message: 'Playlists fetched successfully',
            data: playlists,
        }
    }

    async remove(id: number, user: User) {
        const playlist = await this.playlistsRepository.findOne({ where: { id, user: { id: user.id } } });
        if (!playlist) throw new NotFoundException('Playlist not found or not owned by user');
        await this.playlistVideoRepository.delete({ playlist: { id } });
        await this.playlistsRepository.delete(id);
        return {
            message: 'Playlist deleted successfully',
        }
    }
} 