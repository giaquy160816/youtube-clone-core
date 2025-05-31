import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

function sanitizeString(value: string, strict = false): string {
    let cleaned = value.replace(/<[^>]*>?/gm, '').trim();
    return strict
        ? cleaned.replace(/[^\w\s\-@.]/g, '') // chỉ giữ chữ, số, dấu trừ, khoảng trắng, @, .
        : cleaned.replace(/['"`;]/g, '');
}

@Injectable()
export class SanitizeInputMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        const sanitize = (obj: any): void => {
            if (!obj || typeof obj !== 'object') return;

            for (const key of Object.keys(obj)) {
                const value = obj[key];

                if (typeof value === 'string') {
                    const original = value;
                    const sanitized = sanitizeString(value);

                    if (original !== sanitized) {
                        console.warn(`[Sanitize] "${key}": "${original}" → "${sanitized}"`);
                    }

                    obj[key] = sanitized;
                } else if (
                    typeof value === 'object' &&
                    value !== null &&
                    !Array.isArray(value) &&
                    !(value instanceof Date) &&
                    !Buffer.isBuffer(value)
                ) {
                    sanitize(value); // đệ quy cho object lồng
                }
            }
        };

        if (req.body) sanitize(req.body);
        if (req.query) sanitize(req.query);
        if (req.params) sanitize(req.params);

        next();
    }
}