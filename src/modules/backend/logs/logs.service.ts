import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log, LogType, LogAction } from './entities/log.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class LogsService {
    constructor(
        @InjectRepository(Log)
        private logsRepository: Repository<Log>,
        private jwtService: JwtService,
    ) {}

    private async getUserIdFromToken(token?: string): Promise<string | null> {
        if (!token) return null;
        try {
            const decoded = this.jwtService.verify(token);
            return decoded.sub;
        } catch {
            return null;
        }
    }

    async createLog(data: {
        name: string;
        type: LogType;
        action: LogAction;
        device?: string;
        agent?: string;
        ip?: string;
        other?: Record<string, any>;
        token?: string;
        user_id?: string;
    }) {
        let user_id = data.user_id;
        if (!user_id && data.token) {
            const tokenUserId = await this.getUserIdFromToken(data.token);
            user_id = tokenUserId || undefined;
        }
        
        const { token, ...logData } = data;
        
        const log = this.logsRepository.create({
            ...logData,
            user_id
        });
        return await this.logsRepository.save(log);
    }

    async createAuthLog(data: {
        name: string;
        action: LogAction;
        device?: string;
        agent?: string;
        ip?: string;
        other?: Record<string, any>;
        token?: string;
        user_id?: string;
    }) {
        return this.createLog({
            ...data,
            type: LogType.AUTH,
        });
    }

    async createUserActionLog(data: {
        name: string;
        action: LogAction;
        device?: string;
        agent?: string;
        ip?: string;
        other?: Record<string, any>;
        token?: string;
        user_id?: string;
    }) {
        return this.createLog({
            ...data,
            type: LogType.USER_ACTION,
        });
    }

    async createSystemLog(data: {
        name: string;
        action: LogAction;
        device?: string;
        agent?: string;
        ip?: string;
        other?: Record<string, any>;
        token?: string;
        user_id?: string;
    }) {
        return this.createLog({
            ...data,
            type: LogType.SYSTEM,
        });
    }
} 