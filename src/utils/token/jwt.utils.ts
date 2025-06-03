import { JwtService } from '@nestjs/jwt';
import configuration from '../../config/configuration';

import { encryptPayload } from './jwt-encrypt.utils';
import { parseDurationToSeconds } from '../other/parseDurationToSeconds';

export function generateTokens(jwtService: JwtService, payload: { 
    sub: number; 
    email: string;
    fullname?: string;
    roles?: string;
}) {


    const encrypted = encryptPayload(payload);
    const expiresInNumber = parseDurationToSeconds(configuration().jwt.expires);
    
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
        expiresIn: Math.floor(Date.now() / 1000) + expiresInNumber, // Convert to Unix timestamp
    };
} 