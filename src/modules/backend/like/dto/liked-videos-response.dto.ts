import { ApiProperty } from '@nestjs/swagger';

export class VideoUserDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'John Doe' })
    fullname: string;

    @ApiProperty({ example: 'https://example.com/avatar.jpg' })
    avatar: string;
}

export class VideoDto {
    @ApiProperty({ example: 1 })
    id: number;

    @ApiProperty({ example: 'Amazing Video Title' })
    title: string;

    @ApiProperty({ example: 'This is a great video description' })
    description: string;

    @ApiProperty({ example: 'https://example.com/thumbnail.jpg' })
    image: string;

    @ApiProperty({ example: 'https://example.com/video.mp4' })
    path: string;

    @ApiProperty({ example: 1000 })
    view: number;

    @ApiProperty({ example: true })
    isActive: boolean;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    createdAt: string;

    @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
    updatedAt: string;

    @ApiProperty({ example: 'tag1,tag2,tag3' })
    tags: string;

    @ApiProperty({ type: VideoUserDto })
    user: VideoUserDto;
}

export class LikedVideosResponseDto {
    @ApiProperty({ type: [VideoDto] })
    data: VideoDto[];

    @ApiProperty({ example: 50 })
    total: number;

    @ApiProperty({ example: 1 })
    page: number;

    @ApiProperty({ example: 10 })
    limit: number;

    @ApiProperty({ example: 'Liked videos retrieved successfully' })
    message: string;
} 