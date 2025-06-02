interface VideoDocument {
    id: number;
    title: string;
    description?: string;
    image?: string;
    isActive: boolean;
    path?: string;
    view?: number;
    user_id?: number;
    user_fullname?: string;
    user_avatar?: string;
    createdAt: string; // ✅ Nên luôn có và dạng ISO
}