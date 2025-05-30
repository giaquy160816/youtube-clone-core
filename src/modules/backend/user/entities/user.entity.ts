import { Column, Entity, PrimaryGeneratedColumn, OneToOne, OneToMany, UpdateDateColumn, CreateDateColumn, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { Photo } from "../../photo/entities/photo.entity";
import { Auth } from '../../auth/entities/auth.entity';
import { GroupPermission } from "../../auth/entities/group_permission.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    fullname: string;

    @Column()
    email: string;

    @CreateDateColumn({
        type: 'timestamptz',
    })
    createdAt: Date;

    @UpdateDateColumn({
        type: 'timestamptz',
    })
    updatedAt: Date;

    @OneToMany(() => Photo, (photo) => photo.user)
    photos: Photo[];

    @OneToOne(() => Auth, (auth) => auth.user, { cascade: true })
    @JoinColumn()
    auth: Auth;

    @ManyToMany(() => GroupPermission, (groupPermission) => groupPermission.users)
    @JoinTable()
    groupPermissions: GroupPermission[];
}