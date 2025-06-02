import { Injectable } from '@nestjs/common';
import { VideoService } from 'src/modules/backend/video/video.service';
import { formatDistance } from 'date-fns';
import { vi } from "date-fns/locale";

@Injectable()
export class HomeService {
    constructor(private readonly videoService: VideoService) { }

    async search(q: string, page: number, limit: number) {
        const result = await this.videoService.searchVideos(q, page, limit);
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

    async findOne(id: string) {
        const detail = await this.videoService.findOne(Number(id));

        const res = {
            "id": detail.id,
            "title": detail.title,
            "description": detail.description,
            "image": detail.image,
            "path": detail.path,
            "author": detail.user.fullname,
            "views": detail.view,
            "createdAt": formatDistance(detail.createdAt, new Date(), { addSuffix: true, locale: vi }),
            "avatar": detail.user.avatar,
        }
        console.log(detail);
        
        return {
            'status': 1,
            'data': res 
        }
    }
}
