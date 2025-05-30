import { Controller, Get, Post, Body, Param, Delete, Query, Put, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Permissions } from 'src/decorators/permissions.decorator';
import { ApiOperation, ApiResponse, ApiUnauthorizedResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller()
@UseGuards(AuthGuard)
@ApiBearerAuth('access_token')
export class UserController {
    constructor(private userService: UserService) { }

    @Get('all')     
    @Permissions(['user_get_all'])
    @ApiOperation({ 
        summary: 'Get all users', 
        description: 'Get all users',
        operationId: 'getUsers',
    })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    findAll(): Promise<User[]> {
        return this.userService.findAll();
    }

    @Get('search')
    @ApiOperation({ 
        summary: 'Search users', 
        description: 'Search users by query string',
        operationId: 'searchUsers',
    })
    @ApiResponse({ status: 200, description: 'Users found successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    search(@Query('q') q: string): Promise<User[]> {
        return this.userService.search(q);
    }

    @Get(':id')
    @ApiOperation({ 
        summary: 'Get user by ID', 
        description: 'Get a specific user by their ID',
        operationId: 'getUserById',
    })
    @ApiResponse({ status: 200, description: 'User found successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    findOne(@Param('id') id: string): Promise<User> {
        return this.userService.findOne(id);
    }

    @Get()
    @ApiOperation({ 
        summary: 'Get users', 
        description: 'Get list of users',
        operationId: 'getUsersList',
    })
    @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    find(): Promise<User[]> {
        return this.userService.find();
    }

    @Post()
    @ApiOperation({ 
        summary: 'Create user', 
        description: 'Create a new user',
        operationId: 'createUser',
    })
    @ApiResponse({ status: 201, description: 'User created successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    create(@Body() createUserDto: CreateUserDto): Promise<User> {
        return this.userService.create(createUserDto);
    }

    @Put(':id')
    @ApiOperation({ 
        summary: 'Update user', 
        description: 'Update an existing user',
        operationId: 'updateUser',
    })
    @ApiResponse({ status: 200, description: 'User updated successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<User> {
        return this.userService.update(id, updateUserDto);
    }

    @Delete(':id')
    @ApiOperation({ 
        summary: 'Delete user', 
        description: 'Delete a user by ID',
        operationId: 'deleteUser',
    })
    @ApiResponse({ status: 200, description: 'User deleted successfully' })
    @ApiUnauthorizedResponse({ description: 'Unauthorized' })
    remove(@Param('id') id: string): Promise<{ message: string }> {
        return this.userService.remove(id);
    }
}
