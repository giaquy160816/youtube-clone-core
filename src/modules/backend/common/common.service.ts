import {
    Injectable,
    BadRequestException,
} from '@nestjs/common';
import { writeFile, mkdir } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fromBuffer } from 'file-type';
import { slugifyFilename } from 'src/utils/other/slug.util';

@Injectable()
export class CommonService {
    async uploadImage(file: Express.Multer.File): Promise<string> {
        if (!file) {
            throw new BadRequestException('No file uploaded 1');
        }

        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
        ];

        // Detect real MIME type
        const fileTypeResult = await fromBuffer(file.buffer);
        const mime = fileTypeResult?.mime ?? '';

        if (!allowedMimeTypes.includes(mime)) {
            throw new BadRequestException(
                'Invalid file type. Only JPEG, PNG, GIF, and WEBP are allowed',
            );
        }

        // Generate upload path: /uploads/images/yyyy/mm/dd/
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const dirPath = join(process.cwd(), 'uploads', 'images', year, month, day);
        await mkdir(dirPath, { recursive: true });

        // Normalize filename
        const original = file.originalname ?? `image-${Date.now()}`;
        const safeName = basename(original, extname(original)).replace(/[^a-zA-Z0-9-_]/g, '_');
        const filename = `${Date.now()}-${slugifyFilename(safeName)}.webp`;

        const uploadPath = join(dirPath, filename);
        const relativePath = join('uploads', 'images', year, month, day, filename);

        try {
            const sharp = require('sharp');
            
            const webpBuffer = await sharp(file.buffer)
                .rotate()
                .resize({ width: 2000, withoutEnlargement: true })
                .withMetadata()
                .toFormat('webp')
                .toBuffer();

            await writeFile(uploadPath, webpBuffer);

            // Return relative URL path
            return relativePath.replace(/\\/g, '/');
        } catch (error) {
            console.error('[UploadError]', {
                message: error?.message,
                stack: error?.stack,
                originalname: file.originalname,
                mime,
                size: file.size,
                bufferLength: file.buffer?.length,
            });

            throw new BadRequestException(`Image processing failed: ${error?.message}`);
        }
    }
}