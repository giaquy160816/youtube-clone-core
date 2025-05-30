import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Category } from 'src/modules/backend/category/entities/category.entity';

@Entity('product')
export class Product {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    name: string;

    @Column({ type: 'float', nullable: false })
    price: number;

    @Column({ type: 'text', nullable: true })
    description?: string;

    @Column({ type: 'text', nullable: true })
    image?: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'text', array: true, default: [] })
    album: string[];

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt: Date;

    @ManyToMany(() => Category, (category) => category.products, { cascade: true })
    @JoinTable()
    categories: Category[];
}