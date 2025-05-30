interface JwtDecryptedPayload {
    sub: number;
    email: string;
    fullname?: string;
    roles: string;
}