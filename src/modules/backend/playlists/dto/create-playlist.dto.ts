import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreatePlaylistDto {
    @ApiProperty({ example: 'My Playlist', description: 'Tên playlist' })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({ example: 'This is my favorite playlist', description: 'Mô tả playlist' })
    @IsOptional()
    @IsString()
    description: string;
} 