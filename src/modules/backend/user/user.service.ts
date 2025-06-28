import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository, Like } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findAll(q?: string, page: number = 1, limit: number = 10): Promise<any> {
        const take = limit;
        const skip = (page - 1) * take;

        const queryBuilder = this.userRepository.createQueryBuilder('user');

        if (q) {
            queryBuilder.where('user.fullname LIKE :q OR user.email LIKE :q', { q: `%${q}%` });
        }

        const [data, total] = await queryBuilder.skip(skip).take(take).getManyAndCount();

        return {
            data,
            total,
            page,
            pageSize: take,
            totalPages: Math.ceil(total / take),
        };
    }

    async findOne(id: number): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id: Number(id) } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return {
            // id: user.id,
            fullname: user.fullname,
            phone: user.phone,
            avatar: user.avatar,
            email: user.email,
        };
    }

    async updateMe(id: number, updateUserDto: UpdateUserDto): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Chỉ cho phép update các trường này
        const allowedFields = ['fullname', 'phone', 'avatar'];
        const updateData: Partial<User> = {};
        for (const key of allowedFields) {
            if (key in updateUserDto) {
                updateData[key] = updateUserDto[key];
            }
        }

        // Nếu client truyền trường không hợp lệ thì báo lỗi
        const extraFields = Object.keys(updateUserDto).filter(key => !allowedFields.includes(key));
        if (extraFields.length > 0) {
            throw new HttpException(
                `You are not allowed to update fields: ${extraFields.join(', ')}`,
                HttpStatus.BAD_REQUEST
            );
        }

        const updatedUser = await this.userRepository.save({ ...user, ...updateData });
        if (!updatedUser) {
            throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            message: 'User updated successfully',
        };
    }

    async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
        const user = await this.userRepository.findOne({ where: { id }});
        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }
        if ('email' in updateUserDto) {
            throw new HttpException('You are not allowed to update email', HttpStatus.BAD_REQUEST);
        }

        // Xóa groupPermissionIds khỏi DTO để không bị save vào cột không tồn tại
        const { ...rest } = updateUserDto;

        const updatedUser = await this.userRepository.save({ ...user, ...rest });
        if (!updatedUser) {
            throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
        }
        return {
            message: 'User updated successfully',
        };
    }
}
