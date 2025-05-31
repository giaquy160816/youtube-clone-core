import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Controller()
export class SettingController {
    constructor(private readonly settingService: SettingService) { }

    @Post()
    create(@Body() dto: CreateSettingDto) {
        return this.settingService.create(dto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.settingService.findOne(+id);
    }

    @Get('key/:key')
    findByKey(@Param('key') key: string) {
        return this.settingService.findByKey(key);
    }

    @Get()
    findAll() {
        return this.settingService.findAll();
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
        return this.settingService.update(+id, dto);
    }
}