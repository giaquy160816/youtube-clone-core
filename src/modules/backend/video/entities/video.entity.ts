import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToMany,
} from 'typeorm';
import { User } from 'src/modules/backend/user/entities/user.entity';
import { Watched } from '../../watched/entities/watched.entity';
import { PlaylistVideo } from '../../playlists/entities/playlist-video.entity';

@Entity('video')
export class Video {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    title: string;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'text', nullable: true })
    image?: string;

    @Column({ type: 'text', nullable: true })
    path?: string;

    @Column({ type: 'int', default: 0 })
    view: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.videos, {
        onDelete: 'CASCADE',
    })
    user: User;

    @OneToOne(() => Watched, (watched) => watched.video)
    watched: Watched;

    @OneToMany(() => PlaylistVideo, (playlistVideo) => playlistVideo.video)
    playlistVideos: PlaylistVideo[];
}