import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CompleteVideoUploadDto {
    @ApiProperty({
        description: 'Upload ID received from init-video-upload',
        example: '550e8400-e29b-41d4-a716-446655440000'
    })
    @IsNotEmpty()
    @IsString()
    uploadId: string;
} 