import { Module } from "@nestjs/common";

import { ProductsModule } from "./products/products.module";
import { OrdersModule } from "./orders/orders.module";
import { CustomersModule } from "./customers/customers.module";

@Module({
  imports: [
    ProductsModule,
    OrdersModule,
    CustomersModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
