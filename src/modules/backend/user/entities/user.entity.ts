// src/modules/backend/user/entities/user.entity.ts

import { Column, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, UpdateDateColumn, CreateDateColumn, JoinColumn, ManyToMany, JoinTable, ManyToOne } from "typeorm";
import { Auth } from 'src/modules/backend/auth/entities/auth.entity';
import { Video } from "src/modules/backend/video/entities/video.entity";
import { GroupPermission } from "src/modules/backend/group-permission/entities/group-permission.entity";
import { Playlists } from "src/modules/backend/playlists/entities/playlist.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullname: string;

    @Column()
    email: string;

    @Column()
    phone: string;
    
    @Column()
    avatar: string;

    @Column({
        default: true
    })
    isActive: boolean;

    @CreateDateColumn({
        type: 'timestamptz',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
    })
    updatedAt: Date;

    @OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
    @JoinColumn()
    auth: Auth;

    // Mỗi user thuộc 1 nhóm
    @ManyToOne(() => GroupPermission, group => group.users)
    @JoinColumn()
    groupPermission: GroupPermission;

    @OneToMany(() => Video, (video) => video.user)
    videos: Video[];

    @OneToMany(() => Playlists, (playlist) => playlist.user)
    playlists: Playlists[];
}