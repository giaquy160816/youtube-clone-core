import * as dotenv from 'dotenv';
dotenv.config();

export default () => {
    return {
        database_postgres: {
            type: process.env.DB_POSTGRES_TYPE || 'postgres',
            host: process.env.DB_POSTGRES_HOST || 'postgres-db',
            port: parseInt(process.env.DB_POSTGRES_PORT || '5432', 10),
            username: process.env.DB_POSTGRES_USERNAME || 'myuser',
            password: process.env.DB_POSTGRES_PASSWORD || 'mypassword',
            database: process.env.DB_POSTGRES_DATABASE || 'mydatabase',
        },
        database_mysql: {
            type: process.env.DB_MYSQL_TYPE || 'mysql',
            host: process.env.DB_MYSQL_HOST || 'localhost',
            port: parseInt(process.env.DB_MYSQL_PORT || '3306', 10),
            username: process.env.DB_MYSQL_USERNAME || 'root',
            password: process.env.DB_MYSQL_PASSWORD || '@dmin1234',
            database: process.env.DB_MYSQL_DATABASE || 'learn',
        },
        jwt: {
            secret: process.env.JWT_SECRET || 'c057fe63696eec660c2500876401892c217a4ebd287fef1d3f5e960fb7af3ea07a874f5c718ce458bc66b053fba64e9e7ea66be5895fdc1b83565f84d73999ae98c523491765ce251b7375a18a49bd8a2aecf7408e0cf2af750df607495bc745b9ec0c7fa4fb9afcbc9d59d35803c08c5aad089482cc24a20cbb789078da112af0deb60d5ed4835f77e1d480410d8a318e44322f37ae005213742c9d092792d6c2d88a53522a843cc1a7bb430ad1cf664afdf2baeacc3ba7bd567494b4b3740f266cf5d13e8a8f273aacb9c27107fe34afa7723f1670e687ea82feb56b45aaa0c4fe0a8dbca073a5d2db8cf9e2a29d80c3d3c18536b5863ca8068095f3760d1e',
            expires: process.env.JWT_EXPIRES || '10h',
            refresh: process.env.JWT_REFRESH || '14fc03226adb5a25f397e9a6916714c251db99b82a48125696142f794bb7e9c1d2423dcf77e236243aa7639b11fd1d960f8e3edbeae42bd625c1d80065cb3f991c09e1d144f0dfbf1911738e1f020134999fd22d6ae5acb1d4b55ad2cdb8654e7af8826dc131c5973ee86a3aaf636873a1705fd853e2eadd0993a2045dda6791cad473c4fe0e61e7b5aeaa5ea83fad9ebb067f7bbe1ecb39bfc4d35dff33bb8364a79bbc7c0ceb881e547540ea0841d2ede86834ee019d6ba8f687e65e208c2143d71c15e109448b12dc933134ab757ccf8849cc0e99ecaed849a7927460c8c7e61e7fd5c3920f96c2b91848ced0f22d269930af4d5b0dc2ccb3195a238d64f1',
            refreshExpires: process.env.JWT_REFRESH_EXPIRES || '7d',
        },
        elasticsearch: {
            node: process.env.ELASTICSEARCH_NODE || 'http://elasticsearch:9200'
        },
        redis: {
            host: process.env.REDIS_HOST || 'redis-cache',
            port: parseInt(process.env.REDIS_PORT || '6379', 10),
        },
        rabbitmq: {
            url: process.env.RABBITMQ_URL || 'amqp://rabbituser:rabbitpassword@rabbitmq:5672',
            queue: process.env.RABBITMQ_QUEUE || 'myqueue',
        },
        supabase: {
            url: process.env.SUPABASE_URL || 'https://azedgbttqsdjnfweduoj.supabase.co',
            anonKey: process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF6ZWRnYnR0cXNkam5md2VkdW9qIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3MDI2MjEsImV4cCI6MjA2MjI3ODYyMX0.qGKtqlJGGwl8R8-FnQ7Iv_iZcx2qMolkjOwaJl6oad8',
        },
        smtp: {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '2525', 10),
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
        notify: {
            errorEmail: process.env.ERROR_NOTIFY_EMAIL,
            discordWebhook: process.env.DISCORD_WEBHOOK_URL,
        },
        cors: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:4000').split(','),
        ipWhitelist: (process.env.IP_WHITELIST || '127.0.0.1,::1,::ffff:127.0.0.1').split(','),
        port: parseInt(process.env.PORT || '3001', 10),
        rateLimit: {
            ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10),
            limit: parseInt(process.env.RATE_LIMIT_LIMIT || '2', 10),
        },
    };
};
