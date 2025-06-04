import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from 'src/common/constants/meta-keys';
import { extractTokenFromHeader } from 'src/utils/token/extractToken.utils';
import configuration from 'src/config/configuration';
import { decryptPayload } from 'src/utils/token/jwt-encrypt.utils';
import { sendDiscordNotification } from 'src/utils/notification/discord.service';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Bỏ qua nếu route có @Public()
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic) return true;

        const request = context.switchToHttp().getRequest();
        const token = extractTokenFromHeader(request);
        
        if (!token){
            // send discord notification
            await sendDiscordNotification({
                level: 'error',
                title: '🚨 Auth Guard Error',
                fields: {
                    'Error': 'No token provided',
                    'Time': new Date().toISOString(),
                },
            });
            // send discord notification

            throw new HttpException('No token provided', HttpStatus.UNAUTHORIZED);
        }

        try {
            const decodeToken = await this.jwtService.verifyAsync(token, {
                secret: configuration().jwt.secret,
            });

            const dataPayload = decryptPayload(decodeToken.data) as JwtDecryptedPayload;
            const userRoles = dataPayload.roles.split('|');
            request.user = dataPayload; // Gắn vào request
            console.log('request.user', request.user);
            console.log('userRoles', userRoles);
            // request.user.roles = userRoles;
            return true;
        } catch (error) {
            // send discord notification
            await sendDiscordNotification({
                level: 'error',
                title: '🚨 Auth Guard Error',
                fields: {
                    'Error': error.message,
                    'Time': new Date().toISOString(),
                },
            });
            // send discord notification

            // Handle JWT-specific errors
            switch (error.name) {
                case 'TokenExpiredError':
                    throw new HttpException('Token Expired', HttpStatus.UNAUTHORIZED);
                case 'JsonWebTokenError':
                    throw new HttpException('Invalid Token', HttpStatus.UNAUTHORIZED);
                default:
                    throw new HttpException('Not Valid Token', HttpStatus.UNAUTHORIZED);
            }
            return false;
        }
    }
}