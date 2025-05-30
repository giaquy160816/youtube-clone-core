import { ApiProperty } from '@nestjs/swagger';
import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    Min,
    Max,
    IsArray,
    IsInt,
    IsBoolean,
} from 'class-validator';

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        description: 'The name of the product',
        example: 'Product 1',
    })
    name: string;

    @IsOptional()
    @IsString()
    @ApiProperty({
        description: 'The description of the product',
        example: 'Product 1 description',
    })
    description?: string;

    @IsNumber()
    @Min(0)
    @Max(10000000)
    price: number;

    @IsOptional()
    @IsString()
    image?: string;

    @IsOptional()
    @IsBoolean()
    isActive?: boolean;

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    album?: string[];

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    categories?: number[]; // List of category IDs
}