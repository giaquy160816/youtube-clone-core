// src/modules/backend/group-permission/entities/group-permission.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Permission } from '../../permission/entities/permission.entity';


@Entity('group_permissions')
export class GroupPermission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => Permission, (permission) => permission.groupPermissions)
    permissions: Permission[];

    @ManyToMany(() => User, (user) => user.groupPermissions)
    @JoinTable()
    users: User[];
} 