import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('auth')
export class Auth {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    fullname: string;

    @Column()
    password: string;

    @OneToOne(() => User, (user) => user.auth)
    user: User;
}