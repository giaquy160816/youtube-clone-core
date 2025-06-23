import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Index, OneToMany } from 'typeorm';
import { Video } from '../../video/entities/video.entity';
import { User } from '../../user/entities/user.entity';
import { PlaylistVideo } from './playlist-video.entity';

@Entity('playlists')
export class Playlists {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    description: string;

    @ManyToOne(() => User, (user) => user.playlists, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user: User;

    @OneToMany(() => PlaylistVideo, (playlistVideo) => playlistVideo.playlist)
    playlistVideos: PlaylistVideo[];
}