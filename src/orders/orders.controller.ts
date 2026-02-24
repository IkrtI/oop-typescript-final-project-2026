/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 NestJS Controller: Orders API
 * ═══════════════════════════════════════════════════════════════════════
 *
 * จัดการ HTTP requests ที่เกี่ยวกับออเดอร์
 *
 * Endpoint ที่ต้องมี:
 *   GET    /orders         → ดูออเดอร์ทั้งหมด
 *   GET    /orders/:id     → ดูออเดอร์ตาม ID
 *   POST   /orders         → สร้างออเดอร์ใหม่
 *   PATCH  /orders/:id     → อัปเดตสถานะ/ข้อมูล
 *   DELETE /orders/:id     → ลบออเดอร์ (คืนสต็อก)
 *
 * ⚠️ ไม่มี PUT สำหรับ Orders
 *    เพราะออเดอร์ไม่ควรถูก "แทนที่ทั้งตัว"
 *    ใช้ PATCH ในการแก้ไขบางส่วนเท่านั้น
 *
 * 👤 Assigned to: pockypycok (ณัชชา)
 * ═══════════════════════════════════════════════════════════════════════
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse as SwaggerResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PatchOrderDto } from './dto/patch-order.dto';
import { Order } from './entities/order.entity';
import { ApiResponse } from '../common/interfaces/api-response.interface';

@ApiTags('Orders')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ═══════════════════════════════════════════════════════════════════
  // ✅ ตัวอย่าง: GET /orders — ดูออเดอร์ทั้งหมด
  // ═══════════════════════════════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: 'ดูออเดอร์ทั้งหมด' })
  @SwaggerResponse({ status: 200, description: 'สำเร็จ' })
  async findAll(): Promise<ApiResponse<Order[]>> {
    const orders = await this.ordersService.findAll();
    return {
      success: true,
      message: 'Orders retrieved successfully',
      data: orders,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // 📌 TODO [pockypycok-07]: GET /orders/:id — ดูออเดอร์ตาม ID
  // ─────────────────────────────────────────────────────────────────
  // 💡 ดู pattern จาก ProductsController.findOne()
  // ⬇️ เขียน endpoint ของคุณด้านล่าง ⬇️

  @Get(':id')
  @ApiOperation({ summary: 'ดูออเดอร์ตาม ID' })
  @SwaggerResponse({ status: 200, description: 'สำเร็จ' })
  @SwaggerResponse({ status: 404, description: 'ไม่พบออเดอร์' })
  async findOne(@Param('id') id: string): Promise<ApiResponse<Order>> {
    const order = await this.ordersService.findOne(id);
    return {
      success: true,
      message: 'Order retrieved successfully',
      data: order,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // 📌 TODO [pockypycok-08]: POST /orders — สร้างออเดอร์ใหม่
  // ─────────────────────────────────────────────────────────────────
  // 💡 ดู pattern จาก ProductsController.create()
  //   - ใช้ @HttpCode(HttpStatus.CREATED) สำหรับ status 201
  //   - รับ @Body() dto: CreateOrderDto
  //
  // ⬇️ เขียน endpoint ของคุณด้านล่าง ⬇️

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'สร้างออเดอร์ใหม่ (สั่งซื้อสินค้า)' })
  @SwaggerResponse({ status: 201, description: 'สร้างสำเร็จ' })
  @SwaggerResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง / สต็อกไม่พอ' })
  async create(
    @Body() dto: CreateOrderDto,
  ): Promise<ApiResponse<Order>> {
    const order = await this.ordersService.create(dto);
    return {
      success: true,
      message: 'Order created successfully',
      data: order,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // 📌 TODO [pockypycok-09]: PATCH /orders/:id — อัปเดตออเดอร์
  // ─────────────────────────────────────────────────────────────────
  // 💡 ดู pattern จาก ProductsController.patch()
  //
  // ⬇️ เขียน endpoint ของคุณด้านล่าง ⬇️

  @Patch(':id')
  @ApiOperation({ summary: 'อัปเดตสถานะออเดอร์' })
  @SwaggerResponse({ status: 200, description: 'อัปเดตสำเร็จ' })
  @SwaggerResponse({ status: 404, description: 'ไม่พบออเดอร์' })
  @SwaggerResponse({ status: 400, description: 'State transition ไม่ถูกต้อง' })
  async patch(
    @Param('id') id: string,
    @Body() dto: PatchOrderDto,
  ): Promise<ApiResponse<Order>> {
    const order = await this.ordersService.patch(id, dto);
    return {
      success: true,
      message: 'Order updated successfully',
      data: order,
    };
  }

  // ─────────────────────────────────────────────────────────────────
  // 📌 TODO [pockypycok-10]: DELETE /orders/:id — ลบออเดอร์
  // ─────────────────────────────────────────────────────────────────
  // 💡 ดู pattern จาก ProductsController.remove()
  //
  // ⬇️ เขียน endpoint ของคุณด้านล่าง ⬇️

  @Delete(':id')
  @ApiOperation({ summary: 'ลบออเดอร์ (คืนสต็อก)' })
  @SwaggerResponse({ status: 200, description: 'ลบสำเร็จ' })
  @SwaggerResponse({ status: 404, description: 'ไม่พบออเดอร์' })
  async remove(@Param('id') id: string): Promise<ApiResponse<Order>> {
    const order = await this.ordersService.remove(id);
    return {
      success: true,
      message: 'Order deleted successfully',
      data: order,
    };
  }
}
