import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchVideoService implements OnApplicationBootstrap {
    private readonly indexEs = 'videos';

    constructor(
        private readonly searchService: ElasticsearchService
    ) {}


    // Khi app khởi động se import tất cả video từ DB vào ES
    async onApplicationBootstrap() {
        console.log('elasticsearch service is ready');
        const exists = await this.searchService.indices.exists({ index: this.indexEs });
        if (!exists) {
            await this.searchService.indices.create({ index: this.indexEs });
            await this.searchService.indices.putMapping({
                index: this.indexEs,
                body: {
                    properties: {
                        id: { type: 'integer' },
                        title: {
                            type: 'text',
                            fields: {
                                keyword: { type: 'keyword', ignore_above: 256 }
                            }
                        },
                        description: { type: 'text' },
                        image: { type: 'keyword' },
                        path: { type: 'keyword' },
                        view: { type: 'integer' },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'date', format: 'strict_date_optional_time||epoch_millis' },
                        updatedAt: { type: 'date', format: 'strict_date_optional_time||epoch_millis' },
                        user: {
                            properties: {
                                id: { type: 'integer' },
                                fullname: {
                                    type: 'text',
                                    fields: {
                                        keyword: { type: 'keyword', ignore_above: 256 }
                                    }
                                },
                                avatar: { type: 'keyword' }
                            }
                        }
                    }
                }
            });
            console.log('✅ Index "videos" đã được khởi tạo và mapping.');
        }
    }



    async indexVideo(index: string, document: any) {
        console.log('indexVideo', index, document);
        return await this.searchService.index({
            index: 'videos',
            id: document.id.toString(), // ✅ dùng id làm khóa
            document: document,
        });
    }

    async searchVideo(index: string, query: string) {
        return await this.searchService.search({
            index,
            query: {
                multi_match: {
                    query,
                    fields: ['title', 'description'],
                    fuzziness: 'auto',
                },
            },
        });
    }

    async searchAdvanced(q?: string, page = 1, limit = 2) {
        const from = (page - 1) * limit;
        const isNumber = q && /^\d+$/.test(q);

        // Nếu không có query thì match_all
        const query: any = q
            ? {
                bool: {
                    should: [
                        {
                            match: {
                                title: {
                                    query: q,
                                    fuzziness: 'auto',
                                },
                            },
                        },
                        {
                            match: {
                                description: {
                                    query: q,
                                    fuzziness: 'auto',
                                },
                            },
                        },
                    ],
                },
            }
            : {
                match_all: {},
            };

        // Nếu là số và có query → thêm điều kiện match theo ID
        if (q && isNumber) {
            query.bool.should.push({
                term: {
                    id: parseInt(q),
                },
            });
        }

        const result = await this.searchService.search({
            index: 'videos',
            query,
            from,
            size: limit,
            sort: [
                {
                    id: {
                        order: 'desc',
                    },
                },
            ],
        });

        const total =
            typeof result.hits.total === 'number'
                ? result.hits.total
                : result.hits.total?.value || 0;

        const data = result.hits.hits.map((hit) => hit._source);

        return { data, total, page, limit };
    }

    // Đếm tổng document trong ES
    async countVideosInES(): Promise<number> {
        const res = await this.searchService.count({ index: 'videos' });
        return res.count;
    }

    async reindexAllVideos(videos: any[]) {
        console.log(`🔄 Đang reindex ${videos.length} video...`);
        for (const video of videos) {
            await this.indexVideo('videos', video);
        }
        console.log('✅ Hoàn tất reindex toàn bộ video.');
    }

    async deleteVideoFromIndex(videoId: number) {
        const result = await this.searchService.delete(
            {
                index: 'videos',
                id: videoId.toString(),
            },
            {
                ignore: [404], // ✅ Đặt ở đây!
            }
        );

        if (result.result === 'not_found') {
            return { message: `Video ${videoId} was not found in ES.` };
        }

        return { message: `Video ${videoId} deleted from ES.` };
    }

    async deleteByFieldId(videoId: number) {
        const result = await this.searchService.deleteByQuery({
            index: 'videos',
            query: {
                match: {
                    id: videoId,
                },
            },
        });

        return {
            deleted: result.deleted,
            message: `Đã xoá tất cả document có id = ${videoId}`,
        };
    }
}
