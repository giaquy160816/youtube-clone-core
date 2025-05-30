import * as bcrypt from 'bcrypt';

/**
 * Hash a password using bcrypt
 * @param password The plain text password to hash
 * @param saltRounds The number of salt rounds to use (default: 10)
 * @returns The hashed password
 */
export const hashPassword = async (password: string, saltRounds: number = 10): Promise<string> => {
    return bcrypt.hash(password, saltRounds);
};

/**
 * Compare a plain text password with a hashed password
 * @param password The plain text password to compare
 * @param hashedPassword The hashed password to compare against
 * @returns True if the passwords match, false otherwise
 */
export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};
