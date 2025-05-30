import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('access_token')
export class AccessToken {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    token: string;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'timestamptz', nullable: true })
    expiresAt: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
} 