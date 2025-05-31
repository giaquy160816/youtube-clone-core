import { Column, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, UpdateDateColumn, CreateDateColumn, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Auth } from 'src/modules/backend/auth/entities/auth.entity';
import { GroupPermission } from "src/modules/backend/auth/entities/group_permission.entity";
import { Video } from "src/modules/backend/video/entities/video.entity";

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

    @ManyToMany(() => GroupPermission, (groupPermission) => groupPermission.users)
    @JoinTable()
    groupPermissions: GroupPermission[];

    @OneToMany(() => Video, (video) => video.user)
    videos: Video[];
}