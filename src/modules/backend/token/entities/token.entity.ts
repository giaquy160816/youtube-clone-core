import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('token')
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    token: string;

    @Column()
    description: string;

    @Column(
        {
            type: 'boolean',
            default: true,
        }
    )
    isActive: boolean;
    
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;
}