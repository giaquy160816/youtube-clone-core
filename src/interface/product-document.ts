interface ProductDocument {
    id: number;
    name: string;
    description?: string;
    price: number;
    image?: string;
    isActive: boolean;
    album: string[];
    createdAt: Date;
    updatedAt: Date;
    category_ids: number[];  // Chỉ lưu ID của categories
}