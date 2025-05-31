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


    async findAll(): Promise<Token[]> {
        return this.tokenRepository.find();
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