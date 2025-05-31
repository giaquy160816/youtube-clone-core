import { forwardRef, Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from 'src/service/redis/redis.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User]),
        forwardRef(() => AuthModule),
        RedisModule
    ],
    controllers: [UserController],
    providers: [UserService],
    exports: [UserService],
})
export class UserModule { }
