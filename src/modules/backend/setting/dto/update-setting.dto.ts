import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateSettingDto } from './create-setting.dto';

export class UpdateSettingDto extends PartialType(CreateSettingDto) {
    @ApiProperty({
        description: 'Khóa cài đặt (duy nhất)',
        example: 'site_name',
        type: String,
        required: false
    })
    keys?: string;

    @ApiProperty({
        description: 'Giá trị của cài đặt',
        example: 'YouTube Clone Pro',
        type: String,
        required: false
    })
    value?: string;
}