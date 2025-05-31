import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    keys: string;

    @Column({ type: 'text' })
    value: string;
    
    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

}