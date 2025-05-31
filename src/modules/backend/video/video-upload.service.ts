import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { slugifyFilename } from 'src/utils/other/slug.util';

@Injectable()
export class VideoUploadService {
    private isMP4(buffer: Buffer): boolean {
        // MP4 file signature (ftyp box)
        const signatures = [
            Buffer.from([0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6F, 0x6D]), // ftypisom
            Buffer.from([0x66, 0x74, 0x79, 0x70, 0x6D, 0x70, 0x34, 0x32]), // ftypmp42
            Buffer.from([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x56, 0x20]), // ftypM4V
            Buffer.from([0x66, 0x74, 0x79, 0x70, 0x4D, 0x34, 0x41, 0x20]), // ftypM4A
        ];

        // Check first 8 bytes of the buffer
        const header = buffer.slice(4, 12);
        return signatures.some(signature => header.equals(signature));
    }

    async uploadVideo(file: Express.Multer.File): Promise<string> {
        try {
            // Validate file exists
            if (!file || !file.buffer) {
                throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
            }

            // Validate file type from buffer
            if (!this.isMP4(file.buffer)) {
                throw new HttpException('Invalid file type. Only MP4 video files are allowed', HttpStatus.BAD_REQUEST);
            }

            // Create date-based directory structure
            const date = new Date();
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            
            // Create uploads directory with date structure
            const uploadsDir = path.join(process.cwd(), 'uploads', 'videos', String(year), month, day);
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }

            // Generate filename with timestamp
            const timestamp = Date.now();
            const uniqueFilename = `${timestamp}-${slugifyFilename(file.originalname)}`;
            const filePath = path.join(uploadsDir, uniqueFilename);

            // Save file
            fs.writeFileSync(filePath, file.buffer);

            // Return relative path
            return `/uploads/videos/${year}/${month}/${day}/${uniqueFilename}`;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException('Error uploading file: ' + error.message, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
} 