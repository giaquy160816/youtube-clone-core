import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToOne, JoinColumn, Index } from 'typeorm';
import { Video } from '../../video/entities/video.entity';

@Entity('watched')
export class Watched {
    @Column({ type: 'int', primary: true })
    user_id: number;

    @Column({ type: 'int', primary: true })
    video_id: number;

    @Column({ type: 'timestamptz' })
    watched_at: Date;

    @OneToOne(() => Video, (video) => video.watched, {
        onDelete: 'CASCADE',
    })
    @JoinColumn({ name: 'video_id' })
    video: Video;
}