import { Injectable, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import configuration from 'src/config/configuration';
import { generateTokens } from 'src/utils/token/jwt.utils';
import { User } from 'src/modules/backend/user/entities/user.entity';
import axios from 'axios';
import { generateAuthResponse, createNewUser } from 'src/utils/auth/auth.utils';
import { LogsService } from 'src/modules/backend/logs/logs.service';
import { LogAction } from 'src/modules/backend/logs/entities/log.entity';
import { Request } from 'express';
import { getDeviceInfo } from 'src/utils/device/device.utils';
import { log } from 'console';
import { decryptPayload } from 'src/utils/token/jwt-encrypt.utils';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Auth)
        private authRepository: Repository<Auth>,
        private jwtService: JwtService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private logsService: LogsService,
    ) { }

    async register(registerDto: RegisterDto, req: Request) {
        const { email, fullname, password } = registerDto;

        // Check if email already exists
        const existingAuth = await this.authRepository.findOne({ where: { email } });

        if (existingAuth) {
            throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
        }

        const auth = await createNewUser(this.authRepository, this.userRepository, {
            email,
            fullname,
            password
        });

        const deviceInfo = getDeviceInfo(req);
        await this.logsService.createAuthLog({
            name: `New user registered: ${fullname}`,
            action: LogAction.REGISTER,
            ...deviceInfo,
            other: {
                userId: auth.user.id,
                email: auth.email
            }
        });

        return {
            message: 'Registration successful',
            data: {
                id: auth.id,
                email: auth.email,
            }
        };
    }

    async login(loginDto: LoginDto, req: Request) {
        const { email, password } = loginDto;
        const auth = await this.authRepository.findOne({
            where: { email },
            relations: ['user', 'user.groupPermission', 'user.groupPermission.permissions']
        });
        if (!auth) {
            throw new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST);
        }
        const isMatch = await bcrypt.compare(password, auth.password);
        if (!isMatch) {
            throw new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST);
        }

        const deviceInfo = getDeviceInfo(req);
        await this.logsService.createAuthLog({
            name: `User ${auth.fullname} logged in`,
            action: LogAction.LOGIN,
            ...deviceInfo,
            user_id: auth.user.id.toString(),
            other: {
                email: auth.email
            }
        });
        return generateAuthResponse(this.jwtService, auth);
    }

    async refreshToken(refreshToken: string, req: Request) {
        console.log('refreshToken', refreshToken);
        let decodeToken: any;
        try {
            decodeToken = this.jwtService.verify(refreshToken, {
                secret: configuration().jwt.refresh,
            });
        } catch (err) {
            throw new BadRequestException('Invalid refresh token');
        }
        const dataPayload = decryptPayload(decodeToken.data) as JwtDecryptedPayload;
        const auth = await this.authRepository.findOne({
            where: { email: dataPayload.email },
            relations: ['user', 'user.groupPermission', 'user.groupPermission.permissions']
        });
        if (!auth) {
            throw new BadRequestException('Invalid refresh token');
        }
        const tokens = generateAuthResponse(this.jwtService, auth);

        const deviceInfo = getDeviceInfo(req);
        await this.logsService.createAuthLog({
            name: `Token refreshed for user ${dataPayload.email}`,
            action: LogAction.REFRESH_TOKEN,
            ...deviceInfo,
            other: {
                userId: dataPayload.sub,
                email: dataPayload.email
            }
        });
        return {
            ...tokens
        };
    }

    async loginSupabase(accessToken: string, req: Request) {
        try {
            const res = await axios.get('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            const data = res.data as {
                email: string;
                name: string;
                picture: string;
                id: string;
            };

            const { email, name: fullname, picture: avatar, id: googleId } = data;

            if (!email || !googleId) {
                throw new HttpException('Google không trả thông tin đầy đủ', HttpStatus.UNAUTHORIZED);
            }

            const deviceInfo = getDeviceInfo(req);

            // Tìm user hoặc tạo mới
            const existingAuth = await this.authRepository.findOne({
                where: { email },
                relations: ['user', 'user.groupPermission', 'user.groupPermission.permissions']
            });

            if (existingAuth) {
                await this.logsService.createAuthLog({
                    name: `Google login for existing user ${fullname}`,
                    action: LogAction.LOGIN,
                    ...deviceInfo,
                    user_id: existingAuth.user.id.toString(),
                    other: {
                        email: existingAuth.email,
                        provider: 'google'
                    }
                });
                return generateAuthResponse(this.jwtService, existingAuth);
            }

            // Create new user
            const authNew = await createNewUser(this.authRepository, this.userRepository, {
                email,
                fullname,
                avatar
            });

            if (authNew) {
                await this.logsService.createAuthLog({
                    name: `New user registered via Google: ${fullname}`,
                    action: LogAction.REGISTER,
                    ...deviceInfo,
                    user_id: authNew.user.id.toString(),
                    other: {
                        email: authNew.email,
                        provider: 'google'
                    }
                });
                const existingAuth = await this.authRepository.findOne({
                    where: { email },
                    relations: ['user', 'user.groupPermission', 'user.groupPermission.permissions']
                });
                if (existingAuth) {
                    return generateAuthResponse(this.jwtService, existingAuth);
                }
            }
        } catch (error) {
            console.error('❌ Google token invalid:', error?.response?.data || error.message);
            throw new HttpException('Google token invalid', HttpStatus.UNAUTHORIZED);
        }
    }
} 