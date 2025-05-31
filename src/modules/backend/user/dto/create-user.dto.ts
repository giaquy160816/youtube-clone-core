import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    fullname: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsOptional()
    @IsString()
    phone: string;

    @IsOptional()
    @IsString()
    avatar: string;
}