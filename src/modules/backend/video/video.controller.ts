import {
    Body,
    Controller,
    Post,
    Put,
    Param,
    Get,
    Delete,
    Query,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';
import { VideoService } from './video.service';
import { VideoUploadService } from './video-upload.service';

@Controller()
export class VideoController {
    constructor(
        private readonly videoService: VideoService,
        private readonly videoUploadService: VideoUploadService,
    ) { }

    // cập nhật toàn bộ video từ DB vào ES
    @Post('reindex')
    async reindexAll() {
        return this.videoService.reindexAllToES();
    }

    // tạo video mới
    @Post()
    create(@Body() createVideoDto: CreateVideoDto) {
        return this.videoService.create(createVideoDto);
    }

    // cập nhật video
    @Put(':id')
    update(@Param('id') id: number, @Body() updateVideoDto: UpdateVideoDto) {
        return this.videoService.update(id, updateVideoDto);
    }

    // tìm kiếm video
    @Get('search')
    search(
        @Query('q') q: string,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 2,
    ) {
        return this.videoService.searchVideos(q, Number(page), Number(limit));
    }

    @Get()
    findAll(@Query('page') page: number = 1, @Query('limit') limit: number = 2) {
        return this.videoService.findAll(Number(page), Number(limit));
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
        return this.videoService.delete(id);
    }

    @Delete('es/:id')
    async deleteFromElastic(@Param('id') id: number) {
        return this.videoService.removeVideo(id);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadVideo(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }
        
        const filePath = await this.videoUploadService.uploadVideo(file);
        return {
            path: filePath
        };
    }
}