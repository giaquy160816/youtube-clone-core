import { IsEmail, IsNotEmpty, IsString, IsOptional, IsDate, IsEnum } from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    fullname: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;
}