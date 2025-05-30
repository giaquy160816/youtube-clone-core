import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestTimingMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const startTime = Date.now();

        res.on('finish', () => {
            const duration = Date.now() - startTime;
            console.log(`[${req.method}] ${req.originalUrl} - ${duration}ms`);
        });

        next();
    }
}