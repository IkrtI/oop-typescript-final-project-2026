import { Module, Global } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrdersRepository } from './orders.repository';

@Global()
@Module({
    controllers: [OrdersController],
    providers: [OrdersService, OrdersRepository],
    exports: [OrdersService, OrdersRepository],
})
export class OrdersModule { }
