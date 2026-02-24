/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 DTO สำหรับอัปเดตออเดอร์ (PATCH /orders/:id)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ออเดอร์สามารถอัปเดตได้เฉพาะ 3 field:
 *   - status         → เปลี่ยนสถานะ (ต้องตรวจ State Transition)
 *   - trackingNumber → เพิ่มเลขพัสดุ (ปกติส่งพร้อม status: SHIPPED)
 *   - note           → แก้ไขหมายเหตุ
 *
 * ⚠️ สิ่งที่แก้ไขไม่ได้:
 *   ❌ items        → สั่งไปแล้ว ไม่สามารถเปลี่ยนรายการได้
 *   ❌ totalAmount  → คำนวณจาก items ตอนสร้าง
 *   ❌ customerId   → ไม่สามารถเปลี่ยนเจ้าของออเดอร์
 *
 * 👤 Assigned to: pockypycok (ณัชชา)
 * ═══════════════════════════════════════════════════════════════════════
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional } from 'class-validator';
import { OrderStatus } from '../enums/order-status.enum';

export class PatchOrderDto {
  @ApiPropertyOptional({
    description: 'เปลี่ยนสถานะออเดอร์',
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: 'เลขพัสดุ (ใช้ตอนจัดส่ง)',
    example: 'TH999888777',
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: 'หมายเหตุ',
    example: 'ลูกค้าขอเปลี่ยนที่อยู่',
  })
  @IsOptional()
  @IsString()
  note?: string;
}
