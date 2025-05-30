import { Controller } from '@nestjs/common';
import { Payload, EventPattern } from '@nestjs/microservices';
import { SearchProductService } from './searchproduct.service';

@Controller()
export class ProductMicroservice {
    constructor(
        private readonly searchProductService: SearchProductService,
    ) {}

    @EventPattern('index_product')
    async handleIndexProduct(@Payload() data: { index: string; document: any }) {
        console.log('handleIndexProduct', data);
        return this.searchProductService.indexProduct(data.index, data.document);
    }

    @EventPattern('delete_product_index')
    async handleDeleteProductIndex(@Payload() data: { productId: number }) {
        return this.searchProductService.deleteProductFromIndex(data.productId);
    }

    @EventPattern('reindex_all_products')
    async handleReindexAllProducts(@Payload() data: { products: any[] }) {
        return this.searchProductService.reindexAllProducts(data.products);
    }
} 