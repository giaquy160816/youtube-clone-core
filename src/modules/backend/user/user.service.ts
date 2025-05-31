import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { RedisService } from 'src/service/redis/redis.service';


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        private readonly redisService: RedisService
    ) { }

    async find(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findAll(): Promise<User[]> {
        try {
            const cachedUsers = await this.redisService.getJson<User[]>('users');

            if (cachedUsers) {
                return cachedUsers;
            }

            const users = await this.userRepository.createQueryBuilder('user')
                .select(['user.id', 'user.fullname', 'user.email'])
                .getMany();

            await this.redisService.setJson('users', users, 3600); // TTL 1h
            return users;

        } catch (error) {
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async search(q: string): Promise<User[]> {
        try {
            const users = await this.userRepository.find({
                where: [
                    { fullname: Like(`%${q}%`) },
                    { email: Like(`%${q}%`) },
                ]
            });
            if (users.length === 0) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }
            return users;
        } catch (error) {
            console.error('Search error:', error);
            throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: Number(id) } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: Number(id) } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return this.userRepository.save({ ...user, ...updateUserDto });
    }

}
