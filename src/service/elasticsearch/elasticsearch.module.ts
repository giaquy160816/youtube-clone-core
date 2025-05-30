import { Module, Logger } from '@nestjs/common';
import { ElasticsearchModule, ElasticsearchModuleOptions } from '@nestjs/elasticsearch';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule, // Đảm bảo module config được import
        ElasticsearchModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService): ElasticsearchModuleOptions => {
                const node = configService.get<string>('elasticsearch.node');
                if (!node) {
                    console.error('❌ elasticsearch.node is not defined in environment variables');
                    throw new Error('Missing elasticsearch.node in configuration');
                }
                console.log(`🔧 Connecting to Elasticsearch node: ${node}`, 'ElasticsearchModule');

                return {
                    node,
                    requestTimeout: 5000,  // ✅ 5s timeout
                    pingTimeout: 5000,      // ✅ 5s ping
                    maxRetries: 2,          // ✅ ít retry hơn
                    sniffOnStart: false,    // ✅ không sniff để tránh chậm
                };
            },
        }),
    ],
    exports: [ElasticsearchModule],
})
export class CustomElasticsearchModule {}