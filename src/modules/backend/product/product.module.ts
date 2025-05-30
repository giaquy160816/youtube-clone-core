import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { SearchProductService } from './searchproduct.service';
import { ProductMicroservice } from './product.microservice';
import { CustomElasticsearchModule } from 'src/service/elasticsearch/elasticsearch.module';
import { ClientsModule } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';
import { rabbitMqConfig } from '../../../service/rabbitMQ/rabbitmq.config';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
    imports: [
        TypeOrmModule.forFeature([Product, Category]),
        CustomElasticsearchModule,
        ClientsModule.registerAsync([
            {
                name: 'APP_SERVICE',
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => rabbitMqConfig(configService),
            },
        ]),
    ],
    controllers: [ProductController, ProductMicroservice],
    providers: [ProductService, SearchProductService],
    exports: [ProductService],
})
export class ProductModule {}
