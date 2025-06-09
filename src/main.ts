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
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
//   app.useGlobalInterceptors(new TimeoutInterceptor());
  // Allow all origins for CORS

  const configService = app.get(ConfigService);
  app.enableCors({
    origin: configService.get<string[]>('cors'),
    methods: 'GET,HEAD,PUT,POST,DELETE',
    credentials: true,
  });

  const url = configService.get<string>('rabbitmq.url');
  const queue = configService.get<string>('rabbitmq.queue');

  if (!url || !queue) {
    throw new Error('RabbitMQ configuration is missing');
  }

  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue: queue,
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.startAllMicroservices();

  const config = new DocumentBuilder()
    .setTitle('API - Project Youtube Clone')
    .setDescription('API - Xây dựng ứng dụng Youtube Clone với NestJS')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT Authorization header using the Bearer scheme',
        in: 'header',
        name: 'Authorization',
      },
      'access_token',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
}
bootstrap();
