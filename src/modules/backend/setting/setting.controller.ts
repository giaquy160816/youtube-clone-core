import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { ApiTags, ApiParam, ApiBody, ApiOperation, ApiResponse, ApiConsumes, ApiProduces } from '@nestjs/swagger';

@ApiTags('Backend / Cài đặt')
@Controller()
export class SettingController {
    constructor(private readonly settingService: SettingService) { }

    @Post()
    @ApiOperation({ 
        summary: 'Tạo cài đặt mới', 
        description: 'Tạo một cài đặt mới với dữ liệu được cung cấp' 
    })
    @ApiConsumes('application/json')
    @ApiProduces('application/json')
    @ApiBody({ 
        type: CreateSettingDto,
        description: 'Dữ liệu cài đặt cần tạo',
        required: true
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Cài đặt đã được tạo thành công.',
        type: CreateSettingDto 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Dữ liệu không hợp lệ.' 
    })
    create(@Body() dto: CreateSettingDto) {
        return this.settingService.create(dto);
    }

    @Get('key/:key')
    @ApiOperation({ 
        summary: 'Tìm cài đặt theo khóa', 
        description: 'Lấy thông tin cài đặt dựa trên khóa duy nhất' 
    })
    @ApiProduces('application/json')
    @ApiParam({ 
        name: 'key', 
        description: 'Khóa của cài đặt cần tìm',
        required: true,
        type: String
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Đã tìm thấy cài đặt.',
        type: CreateSettingDto 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy cài đặt.' 
    })
    findByKey(@Param('key') key: string) {
        return this.settingService.findByKey(key);
    }

    @Get()
    @ApiOperation({ 
        summary: 'Lấy tất cả cài đặt', 
        description: 'Lấy danh sách tất cả các cài đặt trong hệ thống' 
    })
    @ApiProduces('application/json')
    @ApiResponse({ 
        status: 200, 
        description: 'Đã lấy danh sách cài đặt thành công.',
        type: [CreateSettingDto]
    })
    findAll() {
        return this.settingService.findAll();
    }

    @Put(':id')
    @ApiOperation({ 
        summary: 'Cập nhật cài đặt', 
        description: 'Cập nhật thông tin cài đặt theo ID' 
    })
    @ApiConsumes('application/json')
    @ApiProduces('application/json')
    @ApiParam({ 
        name: 'id', 
        description: 'ID của cài đặt cần cập nhật',
        required: true,
        type: Number
    })
    @ApiBody({ 
        type: UpdateSettingDto,
        description: 'Dữ liệu cài đặt cần cập nhật',
        required: true
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cài đặt đã được cập nhật thành công.',
        type: UpdateSettingDto 
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy cài đặt.' 
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Dữ liệu không hợp lệ.' 
    })
    update(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
        return this.settingService.update(+id, dto);
    }
}