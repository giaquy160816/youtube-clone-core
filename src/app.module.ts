// Libaries NestJS
import { APP_GUARD } from '@nestjs/core';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerModuleOptions } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RouterModule } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import * as mime from 'mime-types';

// Libaries Third Party
import { createKeyv } from '@keyv/redis'; // kết nối redis
import { rabbitMqConfig } from './service/rabbitMQ/rabbitmq.config'; // kết nối rabbitmq
import { SupabaseService } from './service/supabase/supabase.service'; // kết nối supabase


// Config
import configuration from './config/configuration'; // config

// Database
//datasource
import PostgresDataSource from './datasources/postgres.datasource';
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
import { SearchService } from './service/elasticsearch/search.service';
import { CustomThrottlerGuard } from './guards/other/custom-throttler.guard';

import { Token } from './modules/backend/token/entities/token.entity';
import { ClientsModule } from '@nestjs/microservices';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: ['.env'],
            load: [configuration],
        }),
        ThrottlerModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (configService: ConfigService): ThrottlerModuleOptions => ({
                throttlers: [{
                    ttl: (configService.get<number>('rateLimit.ttl') ?? 60) * 1000, // Convert seconds to milliseconds
                    limit: configService.get<number>('rateLimit.limit') ?? 2,
                }]
            }),
        }),
        CustomElasticsearchModule,
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'uploads'),
            serveRoot: '/uploads',
            serveStaticOptions: {
                setHeaders: (res, path) => {
                    const contentType = mime.lookup(path);
                    if (contentType) {
                        res.setHeader('Content-Type', contentType);
                        res.setHeader('Content-Disposition', 'inline');
                    }
                },
            },
        }),

        RouterModule.register([
            ...frontendRoutes,
            ...backendRoutes,
        ]),
        ...frontendModules,
        ...backendModules,

        TypeOrmModule.forFeature([Token]),
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
        { provide: APP_GUARD, useClass: CustomThrottlerGuard },  //giới hạn số lần gọi API
        { provide: APP_GUARD, useClass: AuthGuard }, // check token jwt
        { provide: APP_GUARD, useClass: DatabaseTokenGuard }, // check token from database
        { provide: APP_GUARD, useClass: RolesGuard }, // check quyền truy cập
        SearchService,
        SupabaseService, // kết nối supabase
    ]
})
export class AppModule implements NestModule {
    constructor() {
        console.log('AppModule constructor');
    }
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                RequestTimingMiddleware,  // request timing ( cảnh báo khi thời gian truy cập qúa lâu)
                IpWhitelistMiddleware,    // ip whitelist ( chỉ cho phép những ip này có quyền truy cập )
                SanitizeInputMiddleware    // sanitize input ( xóa các ký tự đặc biệt trong input )
            )
            .forRoutes('*');
    }
}