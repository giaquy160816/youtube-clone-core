import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Repository } from 'typeorm';
import { USE_DATABASE_TOKEN_KEY } from 'src/decorators/use-database-token.decorator';
import { extractTokenFromHeader } from 'src/utils/token/extractToken.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Token } from 'src/modules/backend/token/entities/token.entity';

@Injectable()
export class DatabaseTokenGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @InjectRepository(Token)
        private readonly tokenRepository: Repository<Token>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Check if route should use database token
        const useDatabaseToken = this.reflector.getAllAndOverride<boolean>(USE_DATABASE_TOKEN_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // If route is not marked to use database token, skip this guard
        if (!useDatabaseToken) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = extractTokenFromHeader(request);

        if (!token) {
            throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
        }

        try {
            // Find token in database
            const tokenEntity = await this.tokenRepository.findOne({
                where: { 
                    token,
                    isActive: true,
                },
                relations: ['user']
            });

            console.log(tokenEntity);

            if (!tokenEntity) {
                throw new HttpException('Invalid token Custom', HttpStatus.UNAUTHORIZED);
            }

            // Check if token is expired
            /*
            if (tokenEntity.expiresAt && new Date() > tokenEntity.expiresAt) {
                throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
            }
            */

            // Get user roles from permissions
            const user = tokenEntity.user;
            

            // Attach user info to request
            request.user = {
                sub: user.id,
                email: user.email,
                fullname: user.fullname
            };

            return true;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Invalid token Custom 1', HttpStatus.UNAUTHORIZED);
        }
    }
} 