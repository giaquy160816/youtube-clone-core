import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class SearchService {
    constructor(
        private readonly elasticsearchService: ElasticsearchService
    ) {
        console.log('search service constructor', this.elasticsearchService.name);
    }

    async indexDocument<T>(index: string, document: any) {
        return this.elasticsearchService.index<T>({
            index: index,
            body: document,
        });
    }

    async searchDocumentsSimpleField<T>(index: string, query: string) {
        return this.elasticsearchService.search<T>({
            index: index,
            query: {
                match: {
                    name: query,
                }
            }
        });
    }

    async searchDocumentsMultiField<T>(index: string, querySearch: string, fields: string[]) {
        return this.elasticsearchService.search<T>({
            index: index,
            query: {
                multi_match: {
                    query: querySearch,
                    fields: fields,
                    fuzziness: 'AUTO',
                    type: 'cross_fields',
                }
            }
        });
    }
}