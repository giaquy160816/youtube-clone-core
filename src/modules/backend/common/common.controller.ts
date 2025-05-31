import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CommonService } from './common.service';
import { Public } from 'src/decorators/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
@Public()
export class CommonController {
    constructor(private readonly commonService: CommonService) { }

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(@UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const filePath = await this.commonService.uploadImage(file);
        return {
            path: filePath
        };
    }
}