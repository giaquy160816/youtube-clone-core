
export interface VideoResponseDetail {
    id: number;
    title: string;
    description: string;
    image: string;
    path: string;
    views: number;
    like: number;
    tags: string[];
    author: string;
    avatar: string;
    createdAt: string;
}
export interface VideoResponse {
    data: VideoResponseDetail | null;
    message: string;
    status: number;
}