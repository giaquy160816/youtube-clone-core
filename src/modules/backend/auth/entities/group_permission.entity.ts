import { Column, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { Permission } from "./permisson.entity";
import { User } from "../../user/entities/user.entity";


@Entity('group_permission')
export class GroupPermission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    name: string;

    @ManyToMany(() => Permission, (permission) => permission.groupPermissions, {
        cascade: true,
    })
    @JoinTable()
    permissions: Permission[];

    @ManyToMany(() => User, (user) => user.groupPermissions)
    users: User[];
}