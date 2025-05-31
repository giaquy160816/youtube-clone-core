import { Module } from '@nestjs/common';
import { HomeService } from './home.service';
import { HomeController } from './home.controller';
import { VideoModule } from 'src/modules/backend/video/video.module';

@Module({
    imports: [VideoModule],
    controllers: [HomeController],
    providers: [HomeService],
})
export class HomeModule { }
