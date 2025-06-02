import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';

// 🔐 Secret dùng cho ký JWT
const secretKey = 'super_jwt_secret';
const encryptionKey = '12345678901234567890123456789012'; // phải đủ 32 ký tự!

export function encryptPayload(payload: object): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
    let encrypted = cipher.update(JSON.stringify(payload));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

export function decryptPayload(encrypted: string): object {
    const [ivHex, encryptedDataHex] = encrypted.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(encryptedDataHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(encryptionKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return JSON.parse(decrypted.toString());
}

export function signEncryptedJwt(payload: object, expiresIn = '1h'): string {
    const encrypted = encryptPayload(payload);
    return jwt.sign({ data: encrypted }, secretKey, { expiresIn });
}

export function verifyEncryptedJwt(token: string): object {
    const decoded = jwt.verify(token, secretKey) as any;
    return decryptPayload(decoded.data);
}


export function generateRandomPassword(length = 16): string {
    return crypto.randomBytes(length).toString('hex').slice(0, length);
}