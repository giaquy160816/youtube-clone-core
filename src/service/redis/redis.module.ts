// redis.module.ts
import { Module } from '@nestjs/common';
import { RedisProvider } from './redis.provider';
import { RedisService } from './redis.service';

@Module({
    providers: [RedisProvider, RedisService],
    exports: [RedisProvider, RedisService],
})
export class RedisModule { }