import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { VideoService } from './video.service';
import { VideoResponse } from 'src/interface/video-response';
import { ApiParam, ApiQuery, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Frontend / Video')
@Controller()
@Public()
export class VideoController {
    constructor(
        private readonly videoService: VideoService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Tìm kiếm video', description: 'API tìm kiếm video theo từ khóa với phân trang' })
    @ApiQuery({ 
        name: 'q',  
        type: String, 
        required: false,
        description: 'Tìm kiếm video theo tên hoặc mô tả. Ví dụ: "video" hoặc "video tutorial"'
    })
    search(@Query('q') q: string, @Query('page') page: number = 1, @Query('limit') limit: number = 2) {
        return this.videoService.search(q, Number(page), Number(limit));
    }

    @Get(':id')
    @ApiOperation({ summary: 'Xem chi tiết video', description: 'API lấy thông tin chi tiết của một video theo ID' })
    @ApiParam({ name: 'id', type: Number, description: 'ID của video' })
    async findOne(@Param('id') id: number): Promise<VideoResponse> {
        console.log('📥 Đã vào view detail:', id);
        const video = await this.videoService.findOne(id);
        return video;
    }
}
