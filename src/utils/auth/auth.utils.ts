import { JwtService } from '@nestjs/jwt';
import { generateTokens } from '../token/jwt.utils';
import { Auth } from 'src/modules/backend/auth/entities/auth.entity';
import { Repository } from 'typeorm';
import { User } from 'src/modules/backend/user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { generateRandomPassword } from '../token/jwt-encrypt.utils';
import { float } from '@elastic/elasticsearch/lib/api/types';

export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
    expiredAt: float;
    user: {
        email: string;
        fullname: string;
        avatar: string;
        phone: string;
    };
}

export interface CreateUserData {
    email: string;
    fullname: string;
    password?: string;
    avatar?: string;
}

export const generateAuthResponse = (
    jwtService: JwtService,
    auth: Auth,
): AuthResponse => {
    const user = auth.user;
    const payload = {
        sub: user.id,
        email: user.email,
    };

    const tokens = generateTokens(jwtService, payload);

    return {
        ...tokens,
        user: {
            email: auth.email,
            fullname: auth.fullname,
            phone: user.phone,
            avatar: user.avatar,
        }
    };
};

export const createNewUser = async (
    authRepository: Repository<Auth>,
    userRepository: Repository<User>,
    data: CreateUserData,
): Promise<Auth> => {
    const password = data.password || generateRandomPassword();
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const auth = authRepository.create({
        email: data.email,
        fullname: data.fullname,
        password: hashedPassword,
    });

    const authNew = await authRepository.save(auth);

    if (authNew) {
        const user = userRepository.create({
            fullname: data.fullname,
            email: data.email,
            phone: '',
            avatar: data.avatar || '',
            auth: authNew,
        });
        const userNew = await userRepository.save(user);

        return {
            ...authNew,
            user: userNew,
        };
    }
    return authNew;
}; 