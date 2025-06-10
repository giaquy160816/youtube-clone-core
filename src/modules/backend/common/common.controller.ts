import { BadRequestException, Controller, Post, UploadedFile, UseInterceptors, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { CommonService } from './common.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { InitVideoUploadDto } from './dto/init-video-upload.dto';
import { UploadVideoChunkDto } from './dto/upload-video-chunk.dto';
import { CompleteVideoUploadDto } from './dto/complete-video-upload.dto';
import { RedisService } from 'src/service/redis/redis.service';

@ApiTags('Backend / Common')
@ApiBearerAuth('access_token')
@Controller()
export class CommonController {
    constructor(
        private readonly commonService: CommonService,
        private readonly redisService: RedisService
    ) {}

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


    @Post('upload-video')
    @UseInterceptors(FileInterceptor('file'))
    @ApiOperation({ summary: 'Upload a small mp4 video (<10MB)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
      schema: {
        type: 'object',
        properties: {
          file: {
            type: 'string',
            format: 'binary',
            description: 'MP4 video file (<10MB)'
          }
        }
      }
    })
    @ApiResponse({
      status: 200,
      description: 'Video uploaded successfully',
      schema: {
        type: 'object',
        properties: {
          path: { type: 'string', description: 'Path to the uploaded video' }
        }
      }
    })
    @ApiResponse({ status: 400, description: 'Bad Request' })
    async uploadVideo(@UploadedFile() file: Express.Multer.File) {
      if (!file) throw new BadRequestException('No file uploaded');
      return this.commonService.uploadSmallVideo(file);
    }

    @Post('init-video-upload')
    @ApiOperation({ summary: 'Initialize a chunked video upload' })
    @ApiBody({ type: InitVideoUploadDto })
    @ApiResponse({
        status: 200,
        description: 'Upload session initialized successfully',
        schema: {
            type: 'object',
            properties: {
                uploadId: {
                    type: 'string',
                    description: 'Unique identifier for this upload session'
                }
            }
        }
    })
    async initVideoUpload(@Body() dto: InitVideoUploadDto) {
        return this.commonService.initVideoUpload(dto.filename, dto.totalSize);
    }

    @Post('upload-video-chunk')
    @UseInterceptors(FileInterceptor('chunk'))
    @ApiOperation({ summary: 'Upload a video chunk' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                uploadId: {
                    type: 'string',
                    description: 'Upload ID received from init-video-upload'
                },
                chunkIndex: {
                    type: 'number',
                    description: 'Index of the chunk (0-based)'
                },
                chunk: {
                    type: 'string',
                    format: 'binary',
                    description: 'Video chunk data'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Chunk uploaded successfully'
    })
    async uploadVideoChunk(
        @Body() dto: UploadVideoChunkDto,
        @UploadedFile() chunk: Express.Multer.File
    ) {
        if (!chunk) {
            throw new BadRequestException('No chunk uploaded');
        }
        await this.commonService.uploadVideoChunk(dto.uploadId, dto.chunkIndex, chunk.buffer);
        return { success: true };
    }

    @Post('complete-video-upload')
    @ApiOperation({ summary: 'Complete a chunked video upload' })
    @ApiBody({ type: CompleteVideoUploadDto })
    @ApiResponse({
        status: 200,
        description: 'Video upload completed successfully',
        schema: {
            type: 'object',
            properties: {
                path: {
                    type: 'string',
                    description: 'Path to the uploaded video'
                }
            }
        }
    })
    async completeVideoUpload(@Body() dto: CompleteVideoUploadDto) {
        return this.commonService.completeVideoUpload(dto.uploadId);
    }

    @Delete('clear-redis')
    @ApiOperation({ 
        summary: 'Clear all Redis cache', 
        description: 'Delete all keys from Redis cache' 
    })
    @ApiResponse({ 
        status: 200, 
        description: 'All Redis cache cleared successfully.',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'All Redis cache cleared successfully'
                },
                deletedKeys: {
                    type: 'number',
                    example: 100
                }
            }
        }
    })
    async clearAllCache() {
        const keys = await this.redisService.keys('*');
        if (keys.length > 0) {
            for (const key of keys) {
                await this.redisService.del(key);
            }
        }
        
        return {
            message: 'All Redis cache cleared successfully',
            deletedKeys: keys.length
        };
    }
}