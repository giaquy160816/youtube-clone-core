import { Request } from 'express';

export const extractTokenFromHeader = (req: Request): string | undefined => {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
}

export const extractTokenFromCookie = (req: Request): string | undefined => {
    return req.cookies['access_token'];
}