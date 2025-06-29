import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSettingDto {
    @ApiProperty({
        description: 'Khóa cài đặt (duy nhất)',
        example: 'site_name',
        type: String,
        required: true
    })
    @IsNotEmpty()
    keys: string;

    @ApiProperty({
        description: 'Giá trị của cài đặt',
        example: 'YouTube Clone',
        type: String,
        required: true
    })
    @IsNotEmpty()
    value: string;
}