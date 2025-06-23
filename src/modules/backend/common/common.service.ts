import {
    Injectable,
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';
import { writeFile, mkdir, readFile, unlink } from 'fs/promises';
import { join, extname, basename } from 'path';
import { fromBuffer } from 'file-type';
import { slugifyFilename } from 'src/utils/other/slug.util';
import { v4 as uuidv4 } from 'uuid';
import { setTimeout } from 'timers/promises';
import { convertVideo } from 'src/utils/other/convertVideoV2';

interface UploadSession {
    id: string;
    filename: string;
    totalSize: number;
    chunks: number;
    uploadedChunks: Set<number>;
    tempDir: string;
}

@Injectable()
export class CommonService {
    private uploadSessions: Map<string, UploadSession> = new Map();

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
        const safeName = basename(original, extname(original)).replace(
            /[^a-zA-Z0-9-_]/g,
            '_',
        );
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

            throw new BadRequestException(
                `Image processing failed: ${error?.message}`,
            );
        }
    }

    async initVideoUpload(
        filename: string,
        totalSize: number,
    ): Promise<{ uploadId: string }> {
        const uploadId = uuidv4();
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        const tempDir = join(process.cwd(), 'uploads', 'temp', uploadId);
        await mkdir(tempDir, { recursive: true });

        const chunkSize = 1024 * 1024 * 10; // 100MB chunks
        const chunks = Math.ceil(totalSize / chunkSize);

        this.uploadSessions.set(uploadId, {
            id: uploadId,
            filename,
            totalSize,
            chunks,
            uploadedChunks: new Set(),
            tempDir,
        });

        return { uploadId };
    }

    async uploadVideoChunk(
        uploadId: string,
        chunkIndex: number,
        chunk: Buffer,
    ): Promise<void> {
        const session = this.uploadSessions.get(uploadId);
        if (!session) {
            throw new NotFoundException('Upload session not found');
        }
        if (chunkIndex >= session.chunks) {
            throw new BadRequestException('Invalid chunk index');
        }

        const chunkPath = join(session.tempDir, `chunk_${chunkIndex}`);
        await writeFile(chunkPath, chunk);
        session.uploadedChunks.add(chunkIndex);
    }

    async completeVideoUpload(uploadId: string): Promise<{ path: string }> {
        const session = this.uploadSessions.get(uploadId);
        if (!session) {
            throw new NotFoundException('Upload session not found');
        }

        if (session.uploadedChunks.size !== session.chunks) {
            throw new BadRequestException('Not all chunks have been uploaded');
        }

        // Generate final upload path
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timestamp = Date.now();
        const safeName = basename(
            session.filename,
            extname(session.filename),
        ).replace(/[^a-zA-Z0-9-_]/g, '_');
        const filename = `${Date.now()}-${slugifyFilename(safeName)}${extname(session.filename)}`;
        
        const finalDir = join(process.cwd(), 'uploads', 'videos', year, month, day, `${timestamp}`);
        await mkdir(finalDir, { recursive: true });

        const finalPath = join(finalDir, filename);
        const relativePath = join('uploads', 'videos', year, month, day, `${timestamp}`, filename);

        // Combine chunks
        const writeStream = require('fs').createWriteStream(finalPath);
        for (let i = 0; i < session.chunks; i++) {
            const chunkPath = join(session.tempDir, `chunk_${i}`);
            const chunkBuffer = await readFile(chunkPath);
            writeStream.write(chunkBuffer);
            await unlink(chunkPath); // Delete chunk after writing
        }
        writeStream.end();

        // Clean up
        await require('fs').promises.rmdir(session.tempDir);
        this.uploadSessions.delete(uploadId);
        await setTimeout(500);

        return {
            path: relativePath,
        };
    }

    async uploadSmallVideo(file: Express.Multer.File): Promise<{ path: string }> {
        if (!file) throw new BadRequestException('No file uploaded');

        // 1. Kiểm tra size < 10MB
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new BadRequestException('File size must be less than 10MB');
        }

        // 2. Kiểm tra đuôi file
        if (!file.originalname.toLowerCase().endsWith('.mp4')) {
            throw new BadRequestException('Only .mp4 files are allowed');
        }

        // 3. Kiểm tra buffer đúng định dạng mp4
        const fileType = await fromBuffer(file.buffer);
        if (!fileType || fileType.mime !== 'video/mp4') {
            throw new BadRequestException('File is not a valid MP4 video');
        }

        // 4. Lưu file vào thư mục uploads/videos/yyyy/mm/dd/
        const now = new Date();
        const year = now.getFullYear().toString();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const timestamp = Date.now();
        const dirPath = join(process.cwd(), 'uploads', 'videos', year, month, day, `${timestamp}`);
        await mkdir(dirPath, { recursive: true });

        const safeName = basename(
            file.originalname,
            extname(file.originalname),
        ).replace(/[^a-zA-Z0-9-_]/g, '_');
        const filename = `${Date.now()}-${slugifyFilename(safeName)}.mp4`;
        const uploadPath = join(dirPath, filename);
        const relativePath = join('uploads', 'videos', year, month, day, `${timestamp}`, filename);
        await writeFile(uploadPath, file.buffer);
        return {
            path: relativePath,
        };
    }
}
