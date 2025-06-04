import { Controller, Get, Param, Query } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';
import { HomeService } from './home.service';
import { ApiDefaultResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Frontend / Home')
@Controller()
@Public()
export class HomeController {
    constructor(
        private readonly homeService: HomeService,
    ) { }

    @Get()
    @ApiOperation({ summary: 'Trang chủ', description: 'Chưa biết viết gì trong đây' })
    home() {
        return { message: 'Hello World' };
    }
}
