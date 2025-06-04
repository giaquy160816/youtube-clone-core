import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

@Injectable()
export class TokenService {
    constructor(
        @InjectRepository(Token)
        private readonly tokenRepository: Repository<Token>,
    ) { }

    async create(dto: CreateTokenDto): Promise<Token> {
        const token = this.tokenRepository.create(dto);
        return this.tokenRepository.save(token);
    }


    async findAll(page: number = 1, limit: number = 10, q?: string) {
        const take = limit;
        const skip = (page - 1) * take;

        const query = this.tokenRepository.createQueryBuilder('token');

        if (q) {
            query.where('token.value LIKE :q', { q: `%${q}%` });
        }

        const [data, total] = await query.skip(skip).take(take).getManyAndCount();

        return {
            data,
            total,
            page,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }

    async findOne(id: number): Promise<Token> {
        const token = await this.tokenRepository.findOne({ where: { id } });
        if (!token) {
            throw new NotFoundException('Token not found');
        }
        return token;
    }

    async update(id: number, dto: UpdateTokenDto): Promise<Token> {
        const token = await this.findOne(id);
        const updated = Object.assign(token, dto);
        return this.tokenRepository.save(updated);
    }
}