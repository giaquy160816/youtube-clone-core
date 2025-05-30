import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { RedisClientType } from 'redis';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,

        @Inject('REDIS_CLIENT')
        private readonly redisClient: RedisClientType
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        return this.userRepository.save(user);
    }

    async find(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findAll(): Promise<User[]> {
        const cached = await this.redisClient.get('users');
        if (cached) {
            console.log('From Redis');
            return JSON.parse(cached);
        }
        console.log('From Database');
        const users = await this.userRepository.createQueryBuilder('user')
            .select([
                'user.id',
                'user.fullname',
                'user.email',
            ])
            .getMany();
        
        await this.redisClient.set('users', JSON.stringify(users), {
            EX: 60,
        });
        return users;
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

    async remove(id: string): Promise<{ message: string }> {
        try {
            const entityManager = this.userRepository.manager;

            const user = await this.userRepository.findOne({
                where: { id: Number(id) },
            });

            if (!user) {
                throw new HttpException('User not found', HttpStatus.NOT_FOUND);
            }

            return { message: 'User and profile deleted successfully' };

        } catch (error) {
            console.error('Error removing user:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to remove user',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
