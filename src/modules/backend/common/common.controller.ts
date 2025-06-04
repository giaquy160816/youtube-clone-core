import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse } from '@nestjs/swagger';

@ApiTags('Backend / Common')
@Controller()
export class CommonController {
    constructor(private readonly commonService: CommonService) { }

    @Post('upload-image')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload an image file' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Image file to upload (supported formats: jpg, jpeg, png, gif)'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Image uploaded successfully',
        schema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Path to the uploaded image'
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: 'Bad Request - No file uploaded'
    })
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