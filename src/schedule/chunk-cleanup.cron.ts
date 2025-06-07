// src/schedule/chunk-cleanup.service.ts
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ChunkCleanupService {
    private readonly chunkRootPath = path.join(process.cwd(), 'uploads', 'temp');

    @Cron('0 * * * *') // chạy mỗi đầu giờ (ví dụ: 1h00, 2h00, 3h00...)
    handleCron() {
        console.log('[⏰] 1 Bắt đầu dọn dẹp thư mục chunk...');

        if (!fs.existsSync(this.chunkRootPath)) {
            console.warn('[⚠] Không tìm thấy thư mục chunk');
            return;
        }

        const folders = fs.readdirSync(this.chunkRootPath);

        for (const folder of folders) {
            const fullPath = path.join(this.chunkRootPath, folder);

            try {
                const stats = fs.statSync(fullPath);
                const ageInMs = Date.now() - stats.mtimeMs;
                const ageInHours = ageInMs / (1000 * 60 * 60);

                if (stats.isDirectory() && ageInHours > 1) {
                    fs.rmSync(fullPath, { recursive: true, force: true });
                    console.log(`[🧹] Đã xoá thư mục: ${fullPath}`);
                }
            } catch (error) {
                console.error(`[❌] Không thể xoá: ${fullPath}`, error);
            }
        }

        console.log('[✅] Dọn dẹp hoàn tất!');
    }
}