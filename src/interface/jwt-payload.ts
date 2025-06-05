interface JwtDecryptedPayload {
    sub: number;
    email: string;
    fullname?: string;
    avatar?: string;
    roles?: string;
}