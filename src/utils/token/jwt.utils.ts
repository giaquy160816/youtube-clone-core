import { JwtService } from '@nestjs/jwt';
import configuration from '../../config/configuration';

import { encryptPayload } from './jwt-encrypt.utils';

export function generateTokens(jwtService: JwtService, payload: { 
    sub: number; 
    email: string;
    fullname?: string;
    roles?: string;
}) {


    const encrypted = encryptPayload(payload);
    console.log(configuration().jwt.secret);
    
    const accessToken = jwtService.sign({ data: encrypted }, {
        secret: configuration().jwt.secret,
        expiresIn: configuration().jwt.expires,
    });
    const refreshToken = jwtService.sign({ data: encrypted }, {
        secret: configuration().jwt.refresh,
        expiresIn: configuration().jwt.refreshExpires,
    });
    return {
        accessToken,
        refreshToken,
        expiresIn: configuration().jwt.expires,
        refreshExpiresIn: configuration().jwt.refreshExpires,
    };
} 