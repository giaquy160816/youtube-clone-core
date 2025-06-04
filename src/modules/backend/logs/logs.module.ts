import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LogsService } from './logs.service';
import { Log } from './entities/log.entity';
import { JwtModule } from '@nestjs/jwt';
import configuration from 'src/config/configuration';

@Module({
    imports: [
        TypeOrmModule.forFeature([Log]),
        JwtModule.register({
            secret: configuration().jwt.secret,
            signOptions: { expiresIn: configuration().jwt.expires || '1h' },
        }),
    ],
    providers: [LogsService],
    exports: [LogsService],
})
export class LogsModule {} 