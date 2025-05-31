import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from 'src/config/configuration';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Auth } from './entities/auth.entity';
import { Permission } from './entities/permisson.entity';
import { JwtService } from '@nestjs/jwt';
import { GroupPermission } from './entities/group_permission.entity';
import { User } from '../user/entities/user.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([Auth, Permission, GroupPermission, User]),
        JwtModule.register({
            secret: configuration().jwt.secret,
            signOptions: { expiresIn: configuration().jwt.expires || '1h' },
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtService],
    exports: [AuthService, JwtModule],
})
export class AuthModule { }
