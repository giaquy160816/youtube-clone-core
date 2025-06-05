import { JwtService } from '@nestjs/jwt';
import configuration from 'src/config/configuration';
import { encryptPayload } from './jwt-encrypt.utils';
import { parseDurationToMilliseconds } from '../other/parseDurationToSeconds';

export function generateTokens(jwtService: JwtService, payload: { 
    sub: number; 
    email: string;
    fullname?: string;
    roles?: string;
}) {
    const encrypted = encryptPayload(payload);

    // ✅ milliseconds
    const expiresInMs = parseDurationToMilliseconds(configuration().jwt.expires);
    const refreshInMs = parseDurationToMilliseconds(configuration().jwt.refreshExpires);

    // ✅ issue JWTs
    const accessToken = jwtService.sign({ data: encrypted }, {
        secret: configuration().jwt.secret,
        expiresIn: configuration().jwt.expires, // "1m", "1h", etc. → string OK
    });

    const refreshToken = jwtService.sign({ data: encrypted }, {
        secret: configuration().jwt.refresh,
        expiresIn: configuration().jwt.refreshExpires,
    });

    return {
        accessToken,
        refreshToken,
        // ✅ trả về timestamp hết hạn đúng (milliseconds)
        expiredAt: Date.now() + expiresInMs,
    };
}