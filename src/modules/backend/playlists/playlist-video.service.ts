import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlaylistVideo } from './entities/playlist-video.entity';
import { CreatePlaylistVideoDto } from './dto/create-playlist-video.dto';
import { UpdatePlaylistVideoDto } from './dto/update-playlist-video.dto';
import { Playlists } from './entities/playlist.entity';
import { Video } from '../video/entities/video.entity';

@Injectable()
export class PlaylistVideoService {
    constructor(
        @InjectRepository(PlaylistVideo)
        private readonly playlistVideoRepository: Repository<PlaylistVideo>,
        @InjectRepository(Playlists)
        private readonly playlistRepository: Repository<Playlists>,
        @InjectRepository(Video)
        private readonly videoRepository: Repository<Video>,
    ) { }

    async create(createDto: CreatePlaylistVideoDto, userId: number) {
        const existingPlaylistVideo = await this.playlistVideoRepository.findOne(
            { where: { playlist: { id: createDto.playlistId }, video: { id: createDto.videoId } } }
        );
        if (existingPlaylistVideo) throw new HttpException('Playlist video already exists', HttpStatus.BAD_REQUEST);

        const playlist = await this.playlistRepository.findOne(
            { where: { id: createDto.playlistId, user: { id: userId } } }
        );
        if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);

        const video = await this.videoRepository.findOne(
            { where: { id: createDto.videoId } }
        );
        if (!video) throw new HttpException('Video not found', HttpStatus.NOT_FOUND);

        const entity = this.playlistVideoRepository.create(
            { ...createDto, playlist, video }
        );
        this.playlistVideoRepository.save(entity);
        return {
            message: 'Playlist video created successfully',
        }
    }


    async remove(playlistId: number, videoId: number, userId: number) {
        const playlistVideo = await this.playlistVideoRepository.findOne({
            where: {
                playlist: { 
                    id: playlistId,
                    user: { id: userId }
                },
                video: { id: videoId }
            },
            relations: ['playlist', 'video']
        });
        if (!playlistVideo) throw new HttpException('Playlist video not found', HttpStatus.NOT_FOUND);

        await this.playlistVideoRepository.remove(playlistVideo);
        return {
            message: 'Playlist video deleted successfully',
        }
    }
} 