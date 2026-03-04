/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 DTO สำหรับรายการสินค้าในออเดอร์ (Nested DTO)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * CreateOrderItemDto ใช้สำหรับ validate ข้อมูลสินค้าแต่ละรายการ
 * ที่ลูกค้าส่งมาตอนสั่งซื้อ
 *
 * 📘 Concept: Nested Validation
 * → DTO สามารถซ้อนกันได้ (DTO ภายใน DTO)
 * → CreateOrderDto มี items: CreateOrderItemDto[]
 * → NestJS จะ validate ทั้ง outer DTO และ inner DTO อัตโนมัติ
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsInt, IsUUID, Min } from "class-validator";

export class CreateOrderItemDto {
  @ApiProperty({
    description: "รหัสสินค้า (UUID format)",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsString()
  @IsUUID()
  productId!: string;

  @ApiProperty({
    description: "จำนวนที่สั่ง (ต้อง >= 1)",
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity!: number;
}
