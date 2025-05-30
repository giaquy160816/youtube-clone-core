import { Module } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { PhotoController } from './photo.controller';
import { Photo } from './entities/photo.entity';
import { User } from '../user/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseService } from 'src/service/supabase/supabase.service';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        TypeOrmModule.forFeature([Photo, User]),
        ConfigModule,
    ],
    controllers: [PhotoController],
    providers: [PhotoService, SupabaseService],
})
export class PhotoModule { }