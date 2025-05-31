import { Controller, Get, Post, Body, Param, Delete, Query, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller()
export class UserController {
    constructor(private userService: UserService) { }

    @Get('all')     
    // @Permissions(['user_get_all'])
    findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get('search')
    search(@Query('q') q: string): Promise<User[]> {
        return this.userService.search(q);
    }

    @Get(':id')
    findOne(@Param('id') id: string): Promise<User> {
        return this.userService.findOne(id);
    }

    @Get()
    find(): Promise<User[]> {
        return this.userService.find();
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

}
