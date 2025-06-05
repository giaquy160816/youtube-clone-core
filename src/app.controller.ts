import { Controller, Inject } from "@nestjs/common";
import { Payload, EventPattern, MessagePattern, ClientProxy } from "@nestjs/microservices";

@Controller()
export class AppController {
    constructor(
        @Inject('APP_SERVICE') private client: ClientProxy
    ) { }

    @EventPattern('my_event')
    handleEvent(@Payload() payload: any) {
        console.log('Event received: ', payload);
        return this.client.emit('send_message', payload);
    }
    

    @MessagePattern('send_message')
    async handleMessage(@Payload() payload: any) {
        console.log('Hello from app controller');
        console.log('User created: ', payload);
    }
}
