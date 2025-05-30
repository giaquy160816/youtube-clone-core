import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { GroupPermission } from "./group_permission.entity";

@Entity('permission')
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    name: string;

    @Column({
        unique: true,
    })
    role: string;
    
    @ManyToMany(() => GroupPermission, (groupPermission) => groupPermission.permissions)
    groupPermissions: GroupPermission[];
}