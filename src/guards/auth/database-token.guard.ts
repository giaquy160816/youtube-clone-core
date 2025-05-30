import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/constants/meta-keys';
import { USE_DATABASE_TOKEN_KEY } from 'src/decorators/use-database-token.decorator';
import { extractTokenFromHeader } from 'src/utils/token/extractToken.utils';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccessToken } from 'src/modules/backend/auth/entities/access-token.entity';

@Injectable()
export class DatabaseTokenGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @InjectRepository(AccessToken)
        private readonly accessTokenRepository: Repository<AccessToken>,
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
            const accessToken = await this.accessTokenRepository.findOne({
                where: { 
                    token,
                    isActive: true,
                },
                relations: ['user']
            });

            console.log(accessToken);

            if (!accessToken) {
                throw new HttpException('Invalid token Custom', HttpStatus.UNAUTHORIZED);
            }

            // Check if token is expired
            if (accessToken.expiresAt && new Date() > accessToken.expiresAt) {
                throw new HttpException('Token expired', HttpStatus.UNAUTHORIZED);
            }

            console.log(accessToken);

            // Get user roles from permissions
            const user = accessToken.user;
            

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