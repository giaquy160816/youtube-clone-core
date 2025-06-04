import { Video } from "src/modules/backend/video/entities/video.entity";

export interface VideoResponse {
    data: Video | null;
    message: string;
    status: number;
}