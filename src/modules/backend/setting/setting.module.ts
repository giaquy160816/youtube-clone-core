import { Module } from '@nestjs/common';
import { SettingService } from './setting.service';
import { SettingController } from './setting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Setting])],
    controllers: [SettingController],
    providers: [SettingService],
    exports: [SettingService],
})
export class SettingModule { }
