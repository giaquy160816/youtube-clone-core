import { 
    IsEmail, 
    IsNotEmpty, 
    IsString, 
    IsOptional, 
    MaxLength, 
    Matches,
    IsNumber
} from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    fullname: string;

    @IsNotEmpty()
    @IsEmail({}, { message: 'Email must be a valid email address' })
    email: string;

    @IsOptional()
    @IsString()
    @MaxLength(10, { message: 'Phone must be at most 10 digits' })
    @Matches(/^\d*$/, { message: 'Phone must contain only digits' })
    phone: string;

    @IsOptional()
    @IsString()
    avatar: string;
}