import { IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateTokenDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    token: string;

    @IsNotEmpty()
    description: string;
}