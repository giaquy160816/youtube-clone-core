import { ApiProperty } from '@nestjs/swagger';

export class SettingResponseDto {
    @ApiProperty({
        description: 'ID của cài đặt',
        example: 1,
        type: Number
    })
    id: number;

    @ApiProperty({
        description: 'Khóa cài đặt (duy nhất)',
        example: 'site_name',
        type: String
    })
    keys: string;

    @ApiProperty({
        description: 'Giá trị của cài đặt',
        example: 'YouTube Clone',
        type: String
    })
    value: string;

    @ApiProperty({
        description: 'Thời gian tạo',
        example: '2024-01-15T10:30:00.000Z',
        type: Date
    })
    createdAt: Date;

    @ApiProperty({
        description: 'Thời gian cập nhật cuối',
        example: '2024-01-15T10:30:00.000Z',
        type: Date
    })
    updatedAt: Date;
} 