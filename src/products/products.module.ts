import { Module, Global } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { ProductsRepository } from './products.repository';

@Global()
@Module({
    controllers: [ProductsController],
    providers: [ProductsService, ProductsRepository],
    exports: [ProductsService, ProductsRepository],
})
export class ProductsModule { }
