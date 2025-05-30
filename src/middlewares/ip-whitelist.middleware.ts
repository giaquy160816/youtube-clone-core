import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IpWhitelistMiddleware implements NestMiddleware {
    constructor(private configService: ConfigService) { }

    use(req: Request, res: Response, next: NextFunction) {
        const forwarded = req.headers['x-forwarded-for'];
        const ip: string = (typeof forwarded === 'string'
            ? forwarded.split(',')[0].trim()
            : req.socket.remoteAddress) ?? 'UNKNOWN_IP';

        const whitelist = this.configService.get<string[]>('ipWhitelist') || [];
        if (!whitelist.includes(ip)) {
            throw new ForbiddenException(`IP ${ip} is not allowed`);
        }

        next();
    }
}