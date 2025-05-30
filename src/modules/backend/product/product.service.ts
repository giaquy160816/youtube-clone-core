import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from '../category/entities/category.entity';
import { SearchProductService } from './searchproduct.service';
import { Public } from 'src/decorators/public.decorator';
import { ClientProxy } from '@nestjs/microservices';


@Injectable()
@Public()
export class ProductService {
    constructor(
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        @InjectRepository(Category)
        private categoryRepository: Repository<Category>,
        private SearchProductService: SearchProductService,
        @Inject('APP_SERVICE') private readonly client: ClientProxy,
    ) {
    }

    async formatAndIndexProduct(product: Product) {
        const formattedProduct: ProductDocument = {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            isActive: product.isActive,
            album: product.album,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt,
            category_ids: product.categories ? product.categories.map(category => category.id) : [],
        };
    
        this.client.emit('index_product', { index: 'products', document: formattedProduct }).subscribe();
        return formattedProduct;
    }
    

    async create(createProductDto: CreateProductDto) {
        const product = new Product();
        product.name = createProductDto.name;
        product.description = createProductDto.description;
        product.price = createProductDto.price;
        product.image = createProductDto.image;
        product.isActive = createProductDto.isActive ?? true;
        product.album = createProductDto.album ?? [];

        // Nếu có danh sách category ID
        if (createProductDto.categories && Array.isArray(createProductDto.categories)) {
            const categoryIds = createProductDto.categories;
            const categories = await this.categoryRepository.find({
                where: { id: In(categoryIds) },
            });

            if (categories.length !== categoryIds.length) {
                throw new HttpException('Some categories were not found', HttpStatus.BAD_REQUEST);
            }

            product.categories = categories;
        }

        const result = await this.productRepository.save(product);

        const formattedProduct = await this.formatAndIndexProduct(result);
        return {
            message: 'Product created successfully',
            result: formattedProduct,
        };
    }

    async update(id: number, updateProductDto: UpdateProductDto) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['categories'],
        });

        if (!product) {
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }

        // Cập nhật các trường đơn giản
        product.name = updateProductDto.name ?? product.name;
        product.description = updateProductDto.description ?? product.description;
        product.price = updateProductDto.price ?? product.price;
        product.image = updateProductDto.image ?? product.image;
        product.isActive = updateProductDto.isActive ?? product.isActive;
        product.album = updateProductDto.album ?? product.album;

        // Cập nhật category nếu có
        if (updateProductDto.categories && Array.isArray(updateProductDto.categories)) {
            const categoryIds = updateProductDto.categories;
            const categories = await this.categoryRepository.find({
                where: { id: In(categoryIds) },
            });

            if (categories.length !== categoryIds.length) {
                throw new HttpException('Some categories were not found', HttpStatus.BAD_REQUEST);
            }

            product.categories = categories;
        }

        const result = await this.productRepository.save(product);

        const formattedProduct = await this.formatAndIndexProduct(result);
        return {
            message: 'Product updated successfully',
        };
    }

    
    async searchProducts(q: string) {
        return this.SearchProductService.searchAdvanced(q);
    }

    async findAll(): Promise<Product[]> {
        return this.productRepository.find();
    }

    async delete(id: number): Promise<void> {
        const result = await this.productRepository.delete(id);
        if (result.affected === 0) {
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }
    }

    async removeProduct(productId: number) {
        await this.productRepository.delete(productId); // xoá trong DB
        const result = await this.SearchProductService.deleteProductFromIndex(productId); // xoá trong ES
        return {
            message: 'Product deleted from DB and ES.',
            result: result,
        };
    }

    async forceDeleteByContent(productId: number) {
        return this.SearchProductService.deleteByFieldId(productId);
    }

    async findOne(id: number) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: ['categories']
        });
        if (!product) {
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }
        return product;
    }

    async reindexAllToES() {
        const products = await this.productRepository.find({
            relations: ['categories'],
        });
        const formattedProducts = await Promise.all(products.map(product => this.formatAndIndexProduct(product)));
        console.log(`🗃️ DB có ${products.length} sản phẩm`);
        return {
            message: 'Reindex all products to ES successfully',
            products: formattedProducts,
        };
    }
}