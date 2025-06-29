import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { SettingService } from './setting.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { SettingResponseDto } from './dto/setting-response.dto';
import { ApiTags, ApiParam, ApiBody, ApiOperation, ApiResponse, ApiConsumes, ApiProduces, ApiExcludeController, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Backend / Cài đặt')
@ApiBearerAuth('access_token')
// @ApiExcludeController()
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
        required: true,
        examples: {
            site_name: {
                summary: 'Cài đặt tên website',
                description: 'Tạo cài đặt cho tên website',
                value: {
                    keys: 'site_name',
                    value: 'YouTube Clone'
                }
            },
            max_upload_size: {
                summary: 'Cài đặt kích thước upload tối đa',
                description: 'Tạo cài đặt cho kích thước file upload tối đa',
                value: {
                    keys: 'max_upload_size',
                    value: '100MB'
                }
            },
            maintenance_mode: {
                summary: 'Cài đặt chế độ bảo trì',
                description: 'Tạo cài đặt cho chế độ bảo trì website',
                value: {
                    keys: 'maintenance_mode',
                    value: 'false'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 201, 
        description: 'Cài đặt đã được tạo thành công.',
        type: SettingResponseDto,
        schema: {
            example: {
                id: 1,
                keys: 'site_name',
                value: 'YouTube Clone',
                createdAt: '2024-01-15T10:30:00.000Z',
                updatedAt: '2024-01-15T10:30:00.000Z'
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Dữ liệu không hợp lệ.',
        schema: {
            example: {
                statusCode: 400,
                message: ['keys should not be empty', 'value should not be empty'],
                error: 'Bad Request'
            }
        }
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
        type: String,
        example: 'site_name'
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Đã tìm thấy cài đặt.',
        type: SettingResponseDto,
        schema: {
            example: {
                id: 1,
                keys: 'site_name',
                value: 'YouTube Clone',
                createdAt: '2024-01-15T10:30:00.000Z',
                updatedAt: '2024-01-15T10:30:00.000Z'
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy cài đặt.',
        schema: {
            example: {
                statusCode: 404,
                message: 'Setting not found',
                error: 'Not Found'
            }
        }
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
        type: [SettingResponseDto],
        schema: {
            example: [
                {
                    id: 1,
                    keys: 'site_name',
                    value: 'YouTube Clone',
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z'
                },
                {
                    id: 2,
                    keys: 'max_upload_size',
                    value: '100MB',
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z'
                },
                {
                    id: 3,
                    keys: 'maintenance_mode',
                    value: 'false',
                    createdAt: '2024-01-15T10:30:00.000Z',
                    updatedAt: '2024-01-15T10:30:00.000Z'
                }
            ]
        }
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
        type: Number,
        example: 1
    })
    @ApiBody({ 
        type: UpdateSettingDto,
        description: 'Dữ liệu cài đặt cần cập nhật',
        required: true,
        examples: {
            update_site_name: {
                summary: 'Cập nhật tên website',
                description: 'Cập nhật tên website mới',
                value: {
                    value: 'YouTube Clone Pro'
                }
            },
            update_upload_size: {
                summary: 'Cập nhật kích thước upload',
                description: 'Cập nhật kích thước file upload tối đa',
                value: {
                    value: '200MB'
                }
            },
            update_maintenance: {
                summary: 'Cập nhật chế độ bảo trì',
                description: 'Bật chế độ bảo trì website',
                value: {
                    value: 'true'
                }
            }
        }
    })
    @ApiResponse({ 
        status: 200, 
        description: 'Cài đặt đã được cập nhật thành công.',
        type: SettingResponseDto,
        schema: {
            example: {
                id: 1,
                keys: 'site_name',
                value: 'YouTube Clone Pro',
                createdAt: '2024-01-15T10:30:00.000Z',
                updatedAt: '2024-01-15T11:45:00.000Z'
            }
        }
    })
    @ApiResponse({ 
        status: 404, 
        description: 'Không tìm thấy cài đặt.',
        schema: {
            example: {
                statusCode: 404,
                message: 'Setting not found',
                error: 'Not Found'
            }
        }
    })
    @ApiResponse({ 
        status: 400, 
        description: 'Dữ liệu không hợp lệ.',
        schema: {
            example: {
                statusCode: 400,
                message: ['value should not be empty'],
                error: 'Bad Request'
            }
        }
    })
    update(@Param('id') id: string, @Body() dto: UpdateSettingDto) {
        return this.settingService.update(+id, dto);
    }
}