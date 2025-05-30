import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { PhotoService } from './photo.service';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Public } from 'src/decorators/public.decorator';
import { FileTypeResult, fromBuffer } from 'file-type';
@ApiTags('photos')
@Controller()
@Public()
export class PhotoController {
    constructor(private readonly photoService: PhotoService) { }

    @Post()
    create(@Body() createPhotoDto: CreatePhotoDto) {
        return this.photoService.create(createPhotoDto);
    }

    @Get()
    findAll() {
        return this.photoService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.photoService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updatePhotoDto: UpdatePhotoDto) {
        return this.photoService.update(+id, updatePhotoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.photoService.remove(+id);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async upload(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        // Kiểm tra MIME thực sự
        const fileType: FileTypeResult | undefined = await fromBuffer(file.buffer);
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];

        if (!fileType || !allowedMimeTypes.includes(fileType.mime)) {
            throw new BadRequestException('Invalid file type. Only JPEG, PNG and GIF are allowed');
        }

        try {
            const result = await this.photoService.upload(file);
            return {
                success: true,
                data: result,
                message: 'File uploaded successfully',
            };
        } catch (error) {
            throw new BadRequestException('Failed to upload file: ' + error.message);
        }
    }
}
