import { Injectable, ConflictException, BadRequestException, HttpStatus, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from './entities/auth.entity';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { LoginGGDto } from './dto/login-gg.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import configuration from 'src/config/configuration';
import { generateTokens } from 'src/utils/token/jwt.utils';
import { User } from 'src/modules/backend/user/entities/user.entity';

// check token jwt gg
import * as adminGG from 'firebase-admin';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(Auth)
        private authRepository: Repository<Auth>,
        private jwtService: JwtService,
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async login(loginDto: LoginDto) {
        const { email, password } = loginDto;
        const auth = await this.authRepository.findOne({
            where: { email },
            relations: ['user', 'user.groupPermissions', 'user.groupPermissions.permissions']
        });
        if (!auth) {
            throw new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST);
        }
        const isMatch = await bcrypt.compare(password, auth.password);
        if (!isMatch) {
            throw new HttpException('Invalid email or password', HttpStatus.BAD_REQUEST);
        }

        const user = auth.user;

        const roles = Array.from(
            new Set(
                user.groupPermissions.flatMap(gp =>
                    gp.permissions.map(p => p.role)
                )
            )
        );

        const payload = {
            sub: user.id,
            email: user.email,
            fullname: user.fullname,
            roles: roles.join('|')
        };
        
        console.log(payload);
        const tokens = generateTokens(
            this.jwtService,
            payload
        );
        return {
            token: tokens,
            message: 'Login successful',
            data: { email: auth.email },
        };
    }


    async register(registerDto: RegisterDto) {
        const { email, fullname, password } = registerDto;

        // Check if email already exists
        const existingAuth = await this.authRepository.findOne({ where: { email } });

        if (existingAuth) {
            throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
        }

        // Hash password
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new auth
        const auth = this.authRepository.create({
            email,
            fullname,
            password: hashedPassword,
        });

        // Save to database
        await this.authRepository.save(auth);

        // Create user row linked to auth
        const user = this.userRepository.create({
            fullname,
            email,
            phone: '', // mặc định rỗng
            avatar: '', // mặc định rỗng
            auth: auth, // liên kết với auth vừa tạo
        });
        await this.userRepository.save(user);

        return {
            message: 'Registration successful',
            data: {
                id: auth.id,
                email: auth.email,
            }
        };
    }

    async refreshToken(refreshTokenDto: RefreshTokenDto) {
        const { refreshToken } = refreshTokenDto;
        let decoded: any;
        try {
            decoded = this.jwtService.verify(refreshToken, {
                secret: configuration().jwt.refresh,
            });
        } catch (err) {
            throw new BadRequestException('Invalid refresh token');
        }
        const payload = { sub: decoded.sub, email: decoded.email };
        const tokens = generateTokens(this.jwtService, payload);
        return {
            token: tokens,
            message: 'Token refreshed',
            data: { email: payload.email },
        };
    }

    async loginGG(token: string) {
        if (!token) {
            throw new BadRequestException('No token provided');
        }
        console.log('token', token);
        try {

            const decoded = await adminGG.auth().verifyIdToken(token);
            console.log('decoded', decoded);
            return {
                message: 'Token is valid',
            };
        } catch (err) {
            throw new BadRequestException('Invalid token');
        }
    }
} 