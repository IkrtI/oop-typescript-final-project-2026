/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 NestJS Concept: Module (โมดูล)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Module คือ "กล่องจัดระเบียบ" ที่รวม Controllers, Services, Repositories
 * ไว้ด้วยกัน เหมือนแผนกในบริษัท
 *
 * AppModule คือ "Root Module" — โมดูลหลักที่รวมทุกอย่างเข้าด้วยกัน
 *
 * 📘 Concept: Dependency Injection Container
 * → NestJS จะอ่าน providers[] → สร้าง instance ของแต่ละ class
 * → แล้ว "ฉีด" เข้าไปในที่ที่ต้องการ (constructor) อัตโนมัติ
 * ═══════════════════════════════════════════════════════════════════════
 */

import { Module } from '@nestjs/common';

// ── Products Domain ──
import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';
import { ProductsRepository } from './products/products.repository';

// ── Orders Domain ──
import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';
import { OrdersRepository } from './orders/orders.repository';

@Module({
  imports: [],
  controllers: [
    ProductsController,  // จัดการ HTTP requests สำหรับ /products
    OrdersController,    // จัดการ HTTP requests สำหรับ /orders
  ],
  providers: [
    // Repositories — ชั้นจัดเก็บข้อมูล
    ProductsRepository,
    OrdersRepository,

    // Services — ชั้นตรรกะทางธุรกิจ
    ProductsService,
    OrdersService,
  ],
})
export class AppModule {}
