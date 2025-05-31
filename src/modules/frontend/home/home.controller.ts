import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { HomeService } from './home.service';

@Controller()
@Public()
export class HomeController {
    constructor(
        private readonly homeService: HomeService,
    ) { }

    @Get('index')
    findAll() {
        return {
            message: 'Hello World',
        };
    }

    @Get('video')
    search(@Query('q') q: string, @Query('page') page: number = 1, @Query('limit') limit: number = 2) {
        return this.homeService.search(q, Number(page), Number(limit));
    }

    @Get('video/:id')
    findOne(@Param('id') id: string) {
        return this.homeService.findOne(id);
    }
}
