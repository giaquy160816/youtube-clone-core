import { ConfigService } from '@nestjs/config';
import { RmqOptions } from '@nestjs/microservices/interfaces';
import { Transport } from '@nestjs/microservices';

export const rabbitMqConfig = (configService: ConfigService): RmqOptions => {
    const url = configService.get<string>('rabbitmq.url');
    const queue = configService.get<string>('rabbitmq.queue');

    if (!url || !queue) {
        throw new Error('RabbitMQ configuration is missing');
    }

    return {
        transport: Transport.RMQ,
        options: {
            urls: [url],
            queue: queue,
            noAck: true,
            queueOptions: {
                durable: false,
            }
        },
    };
};  