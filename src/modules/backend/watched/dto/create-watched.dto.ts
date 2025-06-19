import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateWatchedDto {
    @IsNotEmpty()
    @IsNumber()
    id: number;
}