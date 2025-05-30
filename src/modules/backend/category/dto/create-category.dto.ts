import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}