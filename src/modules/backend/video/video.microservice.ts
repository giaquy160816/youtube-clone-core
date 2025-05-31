import { Controller } from '@nestjs/common';
import { Payload, EventPattern } from '@nestjs/microservices';
import { SearchVideoService } from './video-search.service';

@Controller()
export class VideoMicroservice {
    constructor(
        private readonly searchVideoService: SearchVideoService,
    ) {}

    // Khi có video mới được tạo, se index video vào ES
    @EventPattern('index_video')
    async handleIndexVideo(@Payload() data: { index: string; document: any }) {
        console.log('handleIndexVideo', data);
        return this.searchVideoService.indexVideo(data.index, data.document);
    }

    // Khi có video được xoá, se xoá video khỏi ES
    @EventPattern('delete_video_index')
    async handleDeleteVideoIndex(@Payload() data: { videoId: number }) {
        return this.searchVideoService.deleteVideoFromIndex(data.videoId);
    }

    // cập nhật toàn bộ video từ DB vào ES
    @EventPattern('reindex_all_videos')
    async handleReindexAllVideos(@Payload() data: { videos: any[] }) {
        return this.searchVideoService.reindexAllVideos(data.videos);
    }
} 