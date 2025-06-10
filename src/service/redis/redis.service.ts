import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
    constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) { }

    async setJson(key: string, value: any, ttl = 3600) {
        return this.client.set(key, JSON.stringify(value), 'EX', ttl);
    }
    
    async getJson<T = any>(key: string): Promise<T | null> {
        const data = await this.client.get(key);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (err) {
            console.error(`Invalid JSON in key ${key}:`, data);
            return null;
        }
    }

    async set(key: string, value: string, ttl = 3600) {
        return this.client.set(key, value, 'EX', ttl);
    }

    async get(key: string) {
        return this.client.get(key);
    }

    async incr(key: string) {
        return this.client.incr(key);
    }

    async keys(pattern: string) {
        return this.client.keys(pattern);
    }

    async del(key: string) {
        return this.client.del(key);
    }
}