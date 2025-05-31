import { Controller, Get, Post, Body, Put, Param } from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';

@Controller()
export class TokenController {
    constructor(private readonly tokenService: TokenService) { }

    @Post()
    create(@Body() dto: CreateTokenDto) {
        return this.tokenService.create(dto);
    }

    @Get()
    findAll() {
        return this.tokenService.findAll();
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTokenDto) {
        return this.tokenService.update(+id, dto);
    }
}