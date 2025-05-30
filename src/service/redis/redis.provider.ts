import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

export const RedisProvider = {
    provide: 'REDIS_CLIENT',
    useFactory: (configService: ConfigService) => {
        const redisConfig = configService.get('redis');
        return new Redis({
            host: redisConfig.host,
            port: redisConfig.port,
        });
    },
    inject: [ConfigService],
};