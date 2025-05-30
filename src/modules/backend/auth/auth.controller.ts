import { Controller, Post, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from 'src/decorators/public.decorator';
import { ApiBadRequestResponse, ApiOperation } from '@nestjs/swagger';
import { ApiResponse } from '@nestjs/swagger';

@Controller()
@Public()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiOperation({ 
        summary: 'Login',
        description: 'Login to the application',
        operationId: 'login',
        deprecated: false,
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Login successfully',
        schema: {
            type: 'object',
            properties: {
                access_token: { type: 'string' },
                refresh_token: { type: 'string' },
            },
        },
    })
    @ApiBadRequestResponse({
        description: 'Login failed',
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string' },
            },
        },
    })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('login-gg')
    async loginGG(@Headers('authorization') authHeader: string) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Invalid authorization header format');
        }
        const token = authHeader.split(' ')[1];
        return this.authService.loginGG(token);
    }

    @Post('register')
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('refresh-token')
    async refreshToken(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.refreshToken(refreshTokenDto);
    }

} 