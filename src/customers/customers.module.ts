import { Module, Global } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { CustomersRepository } from './customers.repository';

@Global()
@Module({
    controllers: [CustomersController],
    providers: [CustomersService, CustomersRepository],
    exports: [CustomersService, CustomersRepository],
})
export class CustomersModule { }
