import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class InitVideoUploadDto {
    @ApiProperty({
        description: 'Original filename of the video',
        example: 'my-video.mp4'
    })
    @IsNotEmpty()
    @IsString()
    filename: string;

    @ApiProperty({
        description: 'Total size of the video in bytes',
        example: 10485760,
        type: Number
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(1)
    @Type(() => Number)
    @Transform(({ value }) => Number(value))
    totalSize: number;
} 