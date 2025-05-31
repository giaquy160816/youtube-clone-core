import { Injectable } from '@nestjs/common';
import { VideoService } from 'src/modules/backend/video/video.service';
@Injectable()
export class HomeService {
    constructor(private readonly videoService: VideoService) { }

    async search(q: string, page: number, limit: number) {
        return this.videoService.searchVideos(q, page, limit);
    }

    async findOne(id: string) {
        return this.videoService.findOne(Number(id));
    }
}
