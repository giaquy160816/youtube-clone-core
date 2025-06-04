// src/modules/backend/permission/entities/permission.entity.ts

import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, JoinTable, ManyToMany } from 'typeorm';
import { GroupPermission } from '../../group-permission/entities/group-permission.entity';

@Entity('permissions')
export class Permission {
    @PrimaryGeneratedColumn()
    id: string;

    @Column()
    name: string;

    @Column(
        {
            unique: true,
            nullable: false
        }
    )
    role: string;

    @Column({ 
        default: 0,
    })
    parent: number;

    
    @Column({ nullable: true })
    description: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToMany(() => GroupPermission, (groupPermission) => groupPermission.permissions)
    @JoinTable()
    groupPermissions: GroupPermission[];
} 