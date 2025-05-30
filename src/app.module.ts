// Libaries NestJS
import { APP_GUARD } from '@nestjs/core';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';

// Libaries Third Party
import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';


import configuration from './config/configuration';

//datasource
import PostgresDataSource from './datasources/postgres.datasource';
import MysqlDataSource from './datasources/mysql.datasource';
import { CustomElasticsearchModule } from './service/elasticsearch/elasticsearch.module';


//middlewares
import { SanitizeInputMiddleware } from './middlewares/sanitize-input.middleware';
import { RequestTimingMiddleware } from './middlewares/request-timing.middleware';
import { IpWhitelistMiddleware } from './middlewares/ip-whitelist.middleware';

//routes
import { frontendRoutes, frontendModules } from './routes/frontend.routes';
import { backendRoutes, backendModules } from './routes/backend.routes';


//guards
import { AuthGuard } from './guards/auth/auth.guard';
import { DatabaseTokenGuard } from './guards/auth/database-token.guard';
import { RolesGuard } from 'src/guards/auth/roles.guard';
import { createKeyv } from '@keyv/redis';
import { SearchService } from './service/elasticsearch/search.service';

import { DatabaseService } from './database/database.service';
import { AccessToken } from './modules/backend/auth/entities/access-token.entity';
import { ClientsModule, Transport } from '@nestjs/microservices';

import { rabbitMqConfig } from './service/rabbitMQ/rabbitmq.config';
import { SupabaseService } from './service/supabase/supabase.service';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            load: [configuration],
        }),

        CustomElasticsearchModule,
        RouterModule.register([
            ...frontendRoutes,
            ...backendRoutes,
        ]),
        ...frontendModules,
        ...backendModules,

        TypeOrmModule.forFeature([AccessToken]),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: () => {
                return {
                    ...PostgresDataSource.options,
                    autoLoadEntities: true,
                    synchronize: true,
                }
            },
        }),
        /*
        TypeOrmModule.forRootAsync({
            name: 'mysqlConnection',
            inject: [ConfigService],
            useFactory: () => {
                return {
                    ...MysqlDataSource.options,
                    autoLoadEntities: true,
                    synchronize: true,
                }
            },
        }),
        */
        // AuthModule is imported first to make JwtService available to other modules
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60000,
                    limit: 10,
                },
            ],
        }),
        CacheModule.registerAsync({
            isGlobal: true,
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                ttl: 60000,
                store: [
                    createKeyv(`redis://${configService.get<string>('redis.host')}:${configService.get<number>('redis.port')}`)
                ]
            }),
        }),
        ClientsModule.registerAsync([
            {
                name: 'APP_SERVICE',
                inject: [ConfigService],
                useFactory: (configService: ConfigService) => rabbitMqConfig(configService),
            },
        ])
    ],
    controllers: [],
    providers: [
        { provide: APP_GUARD, useClass: ThrottlerGuard },  //giới hạn số lần gọi API
        { provide: APP_GUARD, useClass: AuthGuard }, // check token jwt
        { provide: APP_GUARD, useClass: DatabaseTokenGuard }, // check token from database
        { provide: APP_GUARD, useClass: RolesGuard },
        SearchService,
        SupabaseService, // check role
        // DatabaseService, // chỉ dùng khi chạy sv lần đầu xoá hết table tạo lại
    ],
})
export class AppModule implements NestModule {
    constructor() {
        const app = initializeApp({
            credential: credential.cert('src/keys/firebase-admin-key.json'),
        });
        console.log('AppModule constructor');
    }
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                // IpWhitelistMiddleware,
                RequestTimingMiddleware,
                SanitizeInputMiddleware
            )
            .forRoutes('*');
    }
}