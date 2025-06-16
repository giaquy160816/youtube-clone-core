import { promisify } from 'util';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

const execAsync = promisify(exec);

export interface ConvertVideoOptions {
    segmentDuration?: number;
    outputDir?: string;
    segmentExtension?: string;
    quality?: 'low' | 'medium' | 'high';
    deleteOriginal?: boolean;
}

export async function convertVideo(
    inputFile: string,
    options: ConvertVideoOptions = {}
) {
    const {
        segmentDuration = 10,
        outputDir,
        segmentExtension = 'seg', // Dùng .seg thay vì .ts
        quality = 'medium',
        deleteOriginal = false
    } = options;

    try {
        // Check file exists
        await fs.access(inputFile);
    } catch {
        throw new Error('File not found');
    }

    const parsed = path.parse(inputFile);
    const targetDir = outputDir || parsed.dir;

    // Tạo thư mục riêng cho từng video
    const videoDir = path.join(targetDir, `${parsed.name}_hls`);
    await fs.mkdir(videoDir, { recursive: true });

    const playlistFile = path.join(videoDir, 'playlist.m3u8');
    const segmentPattern = path.join(videoDir, `segment_%03d.${segmentExtension}`);

    const ffmpegPath = 'ffmpeg';
    const ffprobePath = 'ffprobe';

    // Check codec
    const commandCheck = `${ffprobePath} -v error -select_streams v:0 -show_entries stream=codec_name -of default=noprint_wrappers=1:nokey=1 "${inputFile}"`;

    let codec: string;
    try {
        const check = await execAsync(commandCheck);
        codec = check.stdout.trim();
    } catch (err) {
        codec = '';
    }

    // Quality settings
    const qualitySettings = {
        low: '-crf 28 -preset fast -s 640x360',
        medium: '-crf 23 -preset medium -s 1280x720',
        high: '-crf 18 -preset slow -s 1920x1080'
    };

    let command: string;

    if (codec === 'h264') {
        // Copy mode cho h264 - nhanh nhất
        command = `${ffmpegPath} -i "${inputFile}" \
      -c copy \
      -bsf:v h264_mp4toannexb \
      -start_number 0 \
      -hls_time ${segmentDuration} \
      -hls_list_size 0 \
      -hls_segment_filename "${segmentPattern}" \
      -f hls "${playlistFile}"`;
    } else {
        // Encode mode với quality settings
        command = `${ffmpegPath} -i "${inputFile}" \
      -c:v libx264 \
      -c:a aac \
      ${qualitySettings[quality]} \
      -profile:v baseline \
      -level 3.0 \
      -start_number 0 \
      -hls_time ${segmentDuration} \
      -hls_list_size 0 \
      -hls_segment_filename "${segmentPattern}" \
      -f hls "${playlistFile}"`;
    }

    // Execute conversion
    await execAsync(command.replace(/\s+/g, ' '));

    // Optional: Delete original file
    if (deleteOriginal) {
        await fs.unlink(inputFile);
    }

    // Return info about converted video
    const segments = await fs.readdir(videoDir);
    const segmentFiles = segments.filter(file => file.endsWith(`.${segmentExtension}`));

    return {
        playlistPath: playlistFile.replace('/app/', ''),
        segmentCount: segmentFiles.length,
        outputDir: videoDir.replace('/app/', ''),
        segmentExtension,
        totalSize: await getTotalSize(videoDir)
    };
}

// Helper function để tính tổng kích thước
async function getTotalSize(dirPath: string): Promise<number> {
    try {
        const files = await fs.readdir(dirPath);
        let totalSize = 0;

        for (const file of files) {
            const filePath = path.join(dirPath, file);
            const stats = await fs.stat(filePath);
            totalSize += stats.size;
        }

        return totalSize;
    } catch {
        return 0;
    }
}

// Function để cleanup old segments
export async function cleanupOldSegments(
    outputDir: string,
    maxAgeHours: number = 24
): Promise<void> {
    try {
        const files = await fs.readdir(outputDir);
        const now = Date.now();
        const maxAge = maxAgeHours * 60 * 60 * 1000;

        for (const file of files) {
            const filePath = path.join(outputDir, file);
            const stats = await fs.stat(filePath);

            if (now - stats.mtime.getTime() > maxAge) {
                await fs.unlink(filePath);
            }
        }
    } catch (err) {
        console.error('Cleanup failed:', err);
    }
}

// Function để tạo multiple quality versions
export async function convertToMultipleQualities(
    inputFile: string,
    outputDir: string
): Promise<any[]> {
    const qualities: Array<ConvertVideoOptions['quality']> = ['low', 'medium', 'high'];
    const results: Array<{ quality: ConvertVideoOptions['quality']; playlistPath: string; segmentCount: number; outputDir: string; segmentExtension: string; totalSize: number }> = [];

    for (const quality of qualities) {
        try {
            const result = await convertVideo(inputFile, {
                outputDir: path.join(outputDir, quality || ''),
                quality,
                segmentExtension: 'seg' // Dùng .seg extension
            });
            results.push({ quality, ...result });
        } catch (err) {
            console.error(`Failed to convert ${quality} quality:`, err);
        }
    }

    return results;
}