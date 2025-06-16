import { Controller } from '@nestjs/common';
import { Payload, EventPattern } from '@nestjs/microservices';
import { SearchVideoService } from '../../shared/video/video-search.service';
import { convertVideo } from 'src/utils/other/convertVideoV2';
import { VideoService } from './video.service';
import { sendSlackNotification } from 'src/utils/notification/slack.service';

@Controller()
export class VideoMicroservice {
    constructor(
        private readonly searchVideoService: SearchVideoService,
        private readonly videoService: VideoService,
    ) {}

    // Khi có video mới được tạo, se index video vào ES
    @EventPattern('index_video')
    async handleIndexVideo(@Payload() data: { index: string; document: any }) {
        return this.searchVideoService.indexVideo(data.index, data.document);
    }

    @EventPattern('convert_video')
    async handleConvertVideo(@Payload() data: { videoId: number, videoPath: string }) {
        const pathOut = await convertVideo(data.videoPath);
        const updateVideo = {
            path: pathOut.playlistPath,
        }
        await this.videoService.update(data.videoId, updateVideo);
        await this.searchVideoService.updateVideo(data.videoId.toString(), updateVideo);

        await sendSlackNotification({
            level: 'success',
            title: '🎥 Convert Video',
            fields: {
                'Video ID': data.videoId,
                'Video Path': pathOut.playlistPath,
                'Message': 'Convert video success',
                'Time': new Date().toISOString(),
            },
        });
    }

    // Khi có video được xoá, se xoá video khỏi ES
    @EventPattern('delete_video_index')
    async handleDeleteVideoIndex(@Payload() data: { videoId: number }) {
        return this.searchVideoService.deleteVideoFromIndex(data.videoId);
    }

} 