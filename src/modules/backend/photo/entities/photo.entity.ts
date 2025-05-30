import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { User } from "../../user/entities/user.entity";

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    filename: string;

    @ManyToOne(() => User, (user) => user.photos)
    @JoinColumn({ name: 'userId' }) // Join với bảng User theo userId
    user: User;
}