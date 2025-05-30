import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePhotoDto {
    @IsNotEmpty()
    @IsString()
    name: string;

    @IsNotEmpty()
    @IsString()
    filename: string;

    @IsNotEmpty()
    userId: number; // Chỉ định User ID để tạo mối quan hệ
}