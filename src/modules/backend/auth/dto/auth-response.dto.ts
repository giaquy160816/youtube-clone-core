import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
    @ApiProperty({
        description: 'ID của người dùng',
        example: 'user_id'
    })
    id: string;

    @ApiProperty({
        description: 'Email của người dùng',
        example: 'user@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'Tên của người dùng',
        example: 'User Name'
    })
    name: string;
}

export class AuthResponseDto {
    @ApiProperty({
        description: 'JWT access token dùng để xác thực các request',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;

    @ApiProperty({
        description: 'JWT refresh token dùng để tạo mới access token khi hết hạn',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Thời gian hết hạn của access token (tính bằng giây)',
        example: 36000,
        type: Number
    })
    expiresIn: number;

    @ApiProperty({
        description: 'Thông tin người dùng',
        type: UserResponseDto
    })
    user: UserResponseDto;
}

export class RegisterResponseDto {
    @ApiProperty({
        description: 'ID của người dùng mới đăng ký',
        example: 'new_user_id'
    })
    id: string;

    @ApiProperty({
        description: 'Email của người dùng',
        example: 'newuser@example.com'
    })
    email: string;

    @ApiProperty({
        description: 'Tên của người dùng',
        example: 'New User'
    })
    name: string;

    @ApiProperty({
        description: 'Thời gian tạo tài khoản',
        example: '2024-03-21T10:00:00Z'
    })
    createdAt: string;
}

export class RefreshTokenResponseDto {
    @ApiProperty({
        description: 'JWT access token mới',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    accessToken: string;

    @ApiProperty({
        description: 'JWT refresh token mới',
        example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
    refreshToken: string;

    @ApiProperty({
        description: 'Thời gian hết hạn của access token mới (tính bằng giây)',
        example: 36000,
        type: Number
    })
    expiresIn: number;
} 