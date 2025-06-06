import { Video } from "src/modules/backend/video/entities/video.entity";

export interface VideoResponseDetail {
    id: number;
    title: string;
    description: string;
    image: string;
    path: string;
    views: number;
    author: string;
    avatar: string;
    createdAt: string;
}
export interface VideoResponse {
    data: VideoResponseDetail | null;
    message: string;
    status: number;
}