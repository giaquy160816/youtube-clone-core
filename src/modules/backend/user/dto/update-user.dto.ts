import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MaxLength, Matches, IsArray, IsNumber } from 'class-validator';

export class UpdateUserDto extends OmitType(PartialType(CreateUserDto), ['email'] as const) {
    @IsOptional()
    @IsArray()
    @IsNumber({}, { each: true })
    groupPermissionIds?: number[];
}

export class UpdateMeUserDto {
    @IsOptional()
    @IsString()
    fullname?: string;

    @IsOptional()
    @IsString()
    @MaxLength(10, { message: 'Phone must be at most 10 digits' })
    @Matches(/^\d*$/, { message: 'Phone must contain only digits' })
    phone?: string;

    @IsOptional()
    @IsString()
    avatar?: string;
}