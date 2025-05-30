import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

function sanitizeString(value: string): string {
    return value
        .replace(/<[^>]*>?/gm, '') // loại bỏ thẻ HTML
        .replace(/['"`;]/g, '')    // loại ký tự nguy hiểm đơn giản
        .trim();
}

@Injectable()
export class SanitizeInputMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const sanitize = (obj: any) => {
            for (const key in obj) {
                if (typeof obj[key] === 'string') {
                    obj[key] = sanitizeString(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    sanitize(obj[key]); // xử lý đệ quy
                }
            }
        };

        if (req.body) sanitize(req.body);
        if (req.query) sanitize(req.query);
        if (req.params) sanitize(req.params);

        next();
    }
}