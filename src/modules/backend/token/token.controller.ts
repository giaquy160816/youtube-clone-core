import { Controller, Get, Post, Body, Put, Param, Query } from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { ApiExcludeController, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Backend / Token')
@ApiExcludeController()
@Controller()
export class TokenController {
    constructor(private readonly tokenService: TokenService) { }

    @Post()
    create(@Body() dto: CreateTokenDto) {
        return this.tokenService.create(dto);
    }

    @Get()
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'q', required: false, type: String })
    findAll(
        @Query('page') page?: number,
        @Query('limit') limit?: number,
        @Query('q') q?: string
    ) {
        const pageNum = page ? Number(page) : 1;
        const limitNum = limit ? Number(limit) : 10;
        return this.tokenService.findAll(pageNum, limitNum, q);
    }

    @Put(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTokenDto) {
        return this.tokenService.update(+id, dto);
    }
}