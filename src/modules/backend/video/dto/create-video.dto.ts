import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsBoolean,
    IsNumber,
} from 'class-validator';

export class CreateVideoDto {
    @IsNotEmpty()
    @IsString()
    title: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsString()
    path?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsNumber()
    userId: number;
}