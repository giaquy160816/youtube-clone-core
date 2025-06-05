import { Controller, Post, Body, Headers, UnauthorizedException, Req, Res, Get } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Public } from 'src/decorators/public.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiHeader } from '@nestjs/swagger';
import { AuthResponseDto, RegisterResponseDto } from './dto/auth-response.dto';

@ApiTags('Backend / Auth')
@Controller()
@Public()
export class AuthController {
    constructor(private readonly authService: AuthService) { }


    @Get('refresh-token')
    @ApiOperation({ summary: 'Làm mới access token. Bạn không cần truyền gì backend sẽ tự động lấy thông tin từ cookie để xác thực login tiếp theo' })
    @ApiResponse({
        status: 200,
        description: 'Làm mới token thành công',
        type: AuthResponseDto
    })
    async refreshToken(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const token = req.cookies['refresh_token'];
        console.log('token', token);
        if (!token) throw new UnauthorizedException('Missing refresh token');
        const { accessToken, refreshToken, expiredAt, user } = await this.authService.refreshToken(token, req);

        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true, // nếu dùng HTTPS
            sameSite: 'lax',
            path: '/backend/auth/refresh-token',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });
        return {
            accessToken,
            expiredAt,
            user
        };
    }

    @Post('login')
    @ApiOperation({ summary: 'Đăng nhập bằng email và password' })
    @ApiBody({
        type: LoginDto,
        description: 'Thông tin đăng nhập',
        examples: {
            example1: {
                value: {
                    email: 'hoa@gmail.com',
                    password: '123456',
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Đăng nhập thành công',
        type: AuthResponseDto
    })
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response, @Req() req: Request) {
        const { refreshToken, accessToken, user, expiredAt } = await this.authService.login(loginDto, req);
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true, // nếu dùng HTTPS
            sameSite: 'lax',
            path: '/backend/auth/refresh-token',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
        });

        return {
            accessToken,
            expiredAt,
            user
        };
    }

    @Post('login-google-firebase')
    @ApiOperation({ summary: 'Đăng nhập bằng Google thông qua Firebase' })
    @ApiHeader({
        name: 'authorization',
        description: 'Firebase token',
        required: true,
        schema: {
            type: 'string',
            example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Đăng nhập thành công',
        type: AuthResponseDto
    })
    async loginGG(@Headers('authorization') authHeader: string, @Req() req: Request) {
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Invalid authorization header format');
        }
        const token = authHeader.split(' ')[1];
        return this.authService.loginGG(token, req);
    }

    @Post('login-google-supabase')
    @ApiOperation({ summary: 'Đăng nhập bằng Google thông qua Supabase' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                token: {
                    type: 'string',
                    example: 'google_oauth_token'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Đăng nhập thành công',
        type: AuthResponseDto
    })
    async loginSupabase(@Body('token') token: string, @Req() req: Request) {
        return this.authService.loginSupabase(token, req);
    }

    @Post('register')
    @ApiOperation({ summary: 'Đăng ký tài khoản mới' })
    @ApiBody({
        type: RegisterDto,
        description: 'Thông tin đăng ký',
        examples: {
            example1: {
                value: {
                    email: 'hoa@gmail.com',
                    password: '123456',
                    fullname: 'Trọng Hoá'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Đăng ký thành công',
        type: RegisterResponseDto
    })
    async register(@Body() registerDto: RegisterDto, @Req() req: Request) {
        return this.authService.register(registerDto, req);
    }


    @Post('logout')
    @ApiOperation({ summary: 'Đăng xuất' })
    @ApiResponse({
        status: 200,
        description: 'Đăng xuất thành công',
    })
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: true,
            sameSite: 'lax',
            path: '/backend/auth/refresh-token',
        });

        return { message: 'Logged out successfully' };
    }
} 