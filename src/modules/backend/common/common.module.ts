import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { CommonController } from './common.controller';
import { RedisModule } from 'src/service/redis/redis.module';

@Module({
    imports: [RedisModule],
    controllers: [CommonController],
    providers: [CommonService],
})
export class CommonModule {}
