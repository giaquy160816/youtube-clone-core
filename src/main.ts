import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { TimeoutInterceptor } from './interceptors/timeout/timeout.interceptor';
import * as cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { DocumentBuilder } from '@nestjs/swagger';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe());
    app.useGlobalInterceptors(new TimeoutInterceptor());
    // Allow all origins for CORS

    const configService = app.get(ConfigService);
    app.enableCors({
        origin: configService.get<string[]>('cors.allowedOrigins'),
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        credentials: true,
    });

    const url = configService.get<string>('rabbitmq.url');
    const queue = configService.get<string>('rabbitmq.queue');

    if (!url || !queue) {
        throw new Error('RabbitMQ configuration is missing');
    }

    app.connectMicroservice(
        {
            transport: Transport.RMQ,
            options: {
                urls: [url],
                queue: queue,
                queueOptions: {
                    durable: false,
                },
            },
        },
    );
    await app.startAllMicroservices();

    const config = new DocumentBuilder()
        .setTitle('Đi học cho biết với người ta')
        .setDescription('API đi học cho biết với người ta')
        .setVersion('1.0')
        .addTag('api')
        .addBearerAuth({
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
            description: 'JWT Authorization header using the Bearer scheme',
            in: 'header',
            name: 'Authorization',
        }, 'access_token')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    const port = configService.get<number>('port') || 3000;
    await app.listen(port);
}
bootstrap();
