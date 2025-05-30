import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchProductService implements OnApplicationBootstrap {
    constructor(private readonly searchService: ElasticsearchService) { }

    // Khi app khởi động
    async onApplicationBootstrap() {
        const exists = await this.searchService.indices.exists({ index: 'products' });
        if (!exists) {
            await this.searchService.indices.create({ index: 'products' });
            await this.searchService.indices.putMapping({
                index: 'products',
                body: {
                    properties: {
                        id: { type: 'integer' },
                        name: { type: 'text' },
                        description: { type: 'text' },
                        price: { type: 'float' },
                        image: { type: 'keyword' },
                        isActive: { type: 'boolean' },
                        album: { type: 'keyword' },
                        createdAt: { type: 'date' },
                        updatedAt: { type: 'date' },
                    }
                }
            });
            console.log('✅ Index "products" đã được khởi tạo và mapping.');
        }
    }


    async indexProduct(index: string, document: any) {
        console.log('indexProduct', index, document);
        return await this.searchService.index({
            index: 'products',
            id: document.id.toString(), // ✅ dùng id làm khóa
            document: document,
        });
    }

    async searchProduct(index: string, query: string) {
        return await this.searchService.search({
            index,
            query: {
                multi_match: {
                    query,
                    fields: ['name', 'description'],
                    fuzziness: 'auto',
                },
            },
        });
    }

    async searchAdvanced(q: string) {
        const isNumber = /^\d+$/.test(q); // kiểm tra nếu là số (để match id)

        const query: any = {
            bool: {
                should: [
                    {
                        match: {
                            name: {
                                query: q,
                                fuzziness: 'auto',
                            },
                        },
                    },
                    {
                        match: {
                            'categories.name': {
                                query: q,
                                fuzziness: 'auto',
                            },
                        },
                    },
                ],
            },
        };

        // Nếu là số → thêm điều kiện match id
        if (isNumber) {
            query.bool.should.push({
                term: {
                    id: parseInt(q),
                },
            });
        }

        const result = await this.searchService.search({
            index: 'products',
            query,
        });

        return result.hits.hits.map((hit) => hit._source);
    }

    // Đếm tổng document trong ES
    async countProductsInES(): Promise<number> {
        const res = await this.searchService.count({ index: 'products' });
        return res.count;
    }

    async reindexAllProducts(products: any[]) {
        console.log(`🔄 Đang reindex ${products.length} sản phẩm...`);

        for (const product of products) {
            await this.indexProduct('products', product);
        }

        console.log('✅ Hoàn tất reindex toàn bộ sản phẩm.');
    }

    async deleteProductFromIndex(productId: number) {
        const result = await this.searchService.delete(
            {
                index: 'products',
                id: productId.toString(),
            },
            {
                ignore: [404], // ✅ Đặt ở đây!
            }
        );

        if (result.result === 'not_found') {
            return { message: `Product ${productId} was not found in ES.` };
        }

        return { message: `Product ${productId} deleted from ES.` };
    }

    async deleteByFieldId(productId: number) {
        const result = await this.searchService.deleteByQuery({
            index: 'products',
            query: {
                match: {
                    id: productId,
                },
            },
        });

        return {
            deleted: result.deleted,
            message: `Đã xoá tất cả document có id = ${productId}`,
        };
    }
}
