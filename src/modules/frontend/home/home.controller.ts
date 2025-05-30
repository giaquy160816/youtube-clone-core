import { Controller, Get } from '@nestjs/common';
import { Public } from 'src/decorators/public.decorator';

@Controller()
@Public()
export class HomeController {
    constructor() { }

    @Get('index')
    findAll() {
        return {
            message: 'Hello World',
        };
    }
}
