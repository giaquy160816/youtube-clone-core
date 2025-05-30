import { IsNotEmpty, IsString } from 'class-validator';

export class LoginGGDto {
    @IsNotEmpty()
    @IsString()
    token: string;
} 