import { Injectable } from '@nestjs/common';
import { formatDistance } from 'date-fns';
import { vi } from "date-fns/locale";
import { VideoResponse } from 'src/interface/video-response';
import { VideoCoreService } from 'src/modules/shared/video/video-core.service';

@Injectable()
export class VideoService {
    constructor(
        private readonly videoCoreService: VideoCoreService,
    ) {}

    async search(q: string, page: number, limit: number) {
        const result = await this.videoCoreService.searchVideos(q, page, limit);
        const transformedData = (result.data as any[]).map((video) => ({
            id: video.id,
            title: video.title,
            image: video.image,
            thumbnail: video.image,
            author: video.user_fullname || 'Unknown',
            views: video.view,
            avatar: video.user_avatar,
            createdAt: formatDistance(video.createdAt, new Date(), { addSuffix: true, locale: vi })
        }));
        return {
            data: transformedData,
            total: result.total,
            page: result.page,
            limit: result.limit,
        };
    }
    
    async findOne(id: number): Promise<VideoResponse> {
        const video = await this.videoCoreService.findByIdOrFail(Number(id));

        const videoDetail = {
            id: video.id,
            title: video.title,
            description: video.description || '',
            image: video.image || '',
            path: video.path || '',
            views: video.views,
            author: video.user.fullname || 'No Name',
            avatar: video.user.avatar,
            createdAt: formatDistance(video.createdAt, new Date(), { addSuffix: true, locale: vi }),
        };
        return {
            data: videoDetail,
            message: 'Video found',
            status: 1,
        };
    }
}
