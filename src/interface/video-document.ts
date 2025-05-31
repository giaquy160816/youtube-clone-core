interface VideoDocument {
    id: number;
    title: string;
    description?: string;
    image?: string;
    path?: string;
    isActive: boolean;
    user: any;
}