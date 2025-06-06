import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class UploadVideoChunkDto {
    @ApiProperty({
        description: 'Upload ID received from init-video-upload',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsNotEmpty()
    @IsString()
    uploadId: string;

    @ApiProperty({
        description: 'Chunk index (0-based)',
        example: 0,
        type: Number
    })
    @IsNotEmpty()
    @IsNumber()
    @Min(0)
    @Type(() => Number)
    @Transform(({ value }) => Number(value))
    chunkIndex: number;
} 