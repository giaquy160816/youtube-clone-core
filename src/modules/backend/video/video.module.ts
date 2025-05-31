import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomElasticsearchModule } from 'src/service/elasticsearch/elasticsearch.module';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { rabbitMqConfig } from 'src/service/rabbitMQ/rabbitmq.config';
import { Video } from './entities/video.entity';
import { SearchVideoService } from './video-search.service';
import { VideoController } from './video.controller';
import { VideoMicroservice } from './video.microservice';
import { VideoService } from './video.service';
import { VideoUploadService } from './video-upload.service';


@Module({
    imports: [
        TypeOrmModule.forFeature([Video]),
        CustomElasticsearchModule,
        ClientsModule.registerAsync([
            {
                name: 'APP_SERVICE',
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => rabbitMqConfig(configService),
            },
        ]),
    ],
    controllers: [VideoController, VideoMicroservice],
    providers: [VideoService, SearchVideoService, VideoUploadService],
    exports: [VideoService],
})
export class VideoModule {}
