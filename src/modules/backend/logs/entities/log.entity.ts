import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/modules/backend/user/entities/user.entity';

export enum LogType {
    AUTH = 'auth',
    USER_ACTION = 'user_action',
    SYSTEM = 'system',
}

export enum LogAction {
    // Auth actions
    LOGIN = 'login',
    LOGOUT = 'logout',
    REGISTER = 'register',
    REFRESH_TOKEN = 'refresh_token',
    // User actions
    UPDATE_PROFILE = 'update_profile',
    CHANGE_PASSWORD = 'change_password',
    // System actions
    ERROR = 'error',
    WARNING = 'warning',
    INFO = 'info',
}

@Entity('logs')
export class Log {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({
        type: 'enum',
        enum: LogType,
        default: LogType.USER_ACTION
    })
    type: LogType;

    @Column({
        type: 'enum',
        enum: LogAction
    })
    action: LogAction;

    @Column({ nullable: true })
    device: string;

    @Column({ nullable: true })
    agent: string;

    @Column({ nullable: true })
    ip: string;

    @Column('jsonb', { nullable: true })
    other: Record<string, any>;

    @Column({ nullable: true })
    user_id: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
} 