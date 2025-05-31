import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateSettingDto {
    @IsNotEmpty()
    keys: string;

    @IsNotEmpty()
    value: string;
}