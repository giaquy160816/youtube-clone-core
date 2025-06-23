import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, Column, JoinColumn } from 'typeorm';
import { Playlists } from './playlist.entity';
import { Video } from '../../video/entities/video.entity';

@Entity('playlist_video')
export class PlaylistVideo {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Playlists, (playlist) => playlist.playlistVideos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'playlist_id' })
    playlist: Playlists;

    @ManyToOne(() => Video, (video) => video.playlistVideos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'video_id' })
    video: Video;

    @Column({ type: 'int', nullable: true })
    order: number;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;
} 