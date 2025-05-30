import { Injectable, BadRequestException } from '@nestjs/common';
import { CreatePhotoDto } from './dto/create-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { SupabaseService } from 'src/service/supabase/supabase.service'
import { slugifyFilename } from 'src/utils/other/slug.util';

@Injectable()
export class PhotoService {
    constructor(
        private readonly supabaseService: SupabaseService,
    ) { }

    create(createPhotoDto: CreatePhotoDto) {
        return 'This action adds a new photo';
    }

    findAll() {
        return `This action returns all photo`;
    }

    findOne(id: number) {
        return `This action returns a #${id} photo`;
    }

    update(id: number, updatePhotoDto: UpdatePhotoDto) {
        return `This action updates a #${id} photo`;
    }

    remove(id: number) {
        return `This action removes a #${id} photo`;
    }

    async upload(file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('No file uploaded');
        }

        const timestamp = Date.now();
        const uniqueFilename = `${timestamp}-${slugifyFilename(file.originalname)}`;
        const bucket = 'products';

        try {
            const supabase = this.supabaseService.supabaseClient;

            // Upload the file to Supabase Storage
            const { data, error } = await supabase.storage
                .from(bucket)
                .upload(uniqueFilename, file.buffer, {
                    contentType: file.mimetype,
                    upsert: false,
                });

            if (error) {
                throw new BadRequestException(`Upload failed: ${error.message}`);
            }

            // Retrieve the public URL of the uploaded file
            const { data: publicUrlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(uniqueFilename);

            if (!publicUrlData || !publicUrlData.publicUrl) {
                throw new BadRequestException('Could not generate public URL');
            }

            return {
                filename: uniqueFilename,
                url: publicUrlData.publicUrl,
                size: file.size,
                mimetype: file.mimetype,
            };
        } catch (error) {
            throw new BadRequestException(`Failed to upload file: ${error.message}`);
        }
    }
}
