import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';

@Injectable()
export class SettingService {
    constructor(
        @InjectRepository(Setting)
        private readonly settingRepository: Repository<Setting>,
    ) { }

    async create(dto: CreateSettingDto): Promise<Setting> {
        const setting = this.settingRepository.create(dto);
        return this.settingRepository.save(setting);
    }

    async findByKey(key: string): Promise<Setting | null> {
        return this.settingRepository.findOne({ where: { keys: key } });
    }

    async findAll(): Promise<Setting[]> {
        return this.settingRepository.find();
    }

    async findOne(id: number): Promise<Setting> {
        const setting = await this.settingRepository.findOne({ where: { id } });
        if (!setting) {
            throw new NotFoundException('Setting not found');
        }
        return setting;
    }

    async update(id: number, dto: UpdateSettingDto): Promise<Setting> {
        const setting = await this.findOne(id);
        const updated = Object.assign(setting, dto);
        return this.settingRepository.save(updated);
    }
}