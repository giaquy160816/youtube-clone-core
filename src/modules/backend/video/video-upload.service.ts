import {
  Injectable,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { slugifyFilename } from 'src/utils/other/slug.util';
import * as ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import { promisify } from 'util';
import { exec } from 'child_process';
const execAsync = promisify(exec);
@Injectable()
export class VideoUploadService {
  private isMP4(buffer: Buffer): boolean {
    // MP4 file signature (ftyp box)
    const signatures = [
      Buffer.from([0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d]), // ftypisom
      Buffer.from([0x66, 0x74, 0x79, 0x70, 0x6d, 0x70, 0x34, 0x32]), // ftypmp42
      Buffer.from([0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x56, 0x20]), // ftypM4V
      Buffer.from([0x66, 0x74, 0x79, 0x70, 0x4d, 0x34, 0x41, 0x20]), // ftypM4A
    ];

    // Check first 8 bytes of the buffer
    const header = buffer.slice(4, 12);
    return signatures.some((signature) => header.equals(signature));
  }

  async uploadVideo(file: Express.Multer.File): Promise<string> {
    try {
      // Validate file exists
      if (!file || !file.buffer) {
        throw new HttpException('No file uploaded', HttpStatus.BAD_REQUEST);
      }

      // Validate file type from buffer
      if (!this.isMP4(file.buffer)) {
        throw new HttpException(
          'Invalid file type. Only MP4 video files are allowed',
          HttpStatus.BAD_REQUEST,
        );
      }
      if (!ffmpegInstaller || !ffmpegInstaller.path) {
        throw new InternalServerErrorException(
          'FFmpeg not found. Ensure @ffmpeg-installer/ffmpeg is installed or FFmpeg is available in PATH.',
        );
      }

      // Create date-based directory structure
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // Create uploads directory with date structure
      const timestamp = Date.now();
      const uploadsDir = path.join(
        process.cwd(),
        'uploads',
        'videos',
        String(year),
        month,
        day,
        `${timestamp}`,
      );
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate filename with timestamp
      const uniqueFilename = `${timestamp}.mp4`;
      const uniqueFilenameConvert = `${timestamp}.m3u8`;
      const filePath = path.join(uploadsDir, uniqueFilename);
      // const uploadsDirConvert = path.join(uploadsDir, `${timestamp}`);
      // if (!fs.existsSync(uploadsDirConvert)) {
      //   fs.mkdirSync(uploadsDirConvert, { recursive: true });
      // }
      // Save file
      fs.writeFileSync(filePath, file.buffer);
      // const uploadsDirConvert = path.join(uploadsDir, `${timestamp}`);
      // if (!fs.existsSync(uploadsDirConvert)) {
      //   fs.mkdirSync(uploadsDirConvert, { recursive: true });
      // }
      const outputPath = path.join(uploadsDir, uniqueFilenameConvert);
      console.log(outputPath);
      const ffmpegPath = ffmpegInstaller.path;
      const command = `${ffmpegPath} -i "${filePath}" -profile:v baseline -level 3.0 -start_number 0 -hls_time 60 -hls_list_size 0 -f hls "${outputPath}"`;

      await execAsync(command);

      // Return relative path
      return `/uploads/videos/${year}/${month}/${day}/${timestamp}/${uniqueFilenameConvert}`;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Error uploading file: ' + error.message,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
