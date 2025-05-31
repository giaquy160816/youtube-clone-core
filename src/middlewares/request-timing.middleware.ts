// middleware/request-timing.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { sendDiscordNotification } from 'src/utils/notification/discord.service';
import { RequestContext } from '../common/request-context.service';


@Injectable()
export class RequestTimingMiddleware implements NestMiddleware {
    use(
        req: Request,
        res: Response,
        next: NextFunction
    ) {
        RequestContext.run(req, () => {
            const startTime = Date.now();

            res.on('finish', async () => {
                const duration = Date.now() - startTime;
                console.log(`[${req.method}] ${req.originalUrl} - ${duration}ms`);

                if (duration > 5000) {
                    // send discord notification
                    await sendDiscordNotification({
                        level: 'warn',
                        title: '⏱️ Cảnh báo request chậm',
                        fields: {
                            'Reason': 'Request slow',
                            'Duration': duration,
                            'Time': new Date().toISOString(),
                        },
                    });
                    // send discord notification
                }
            });

            next();
        });
    }
}