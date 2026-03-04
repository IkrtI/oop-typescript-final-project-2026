/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 DTO สำหรับสร้างออเดอร์ใหม่ (POST /orders)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * เมื่อลูกค้าสั่งซื้อ ต้องส่งข้อมูลเหล่านี้:
 *   - customerId      → รหัสลูกค้า
 *   - items           → รายการสินค้า (array ของ { productId, quantity })
 *   - paymentMethod   → วิธีชำระเงิน (CREDIT_CARD, BANK_TRANSFER, COD)
 *   - shippingAddress → ที่อยู่จัดส่ง
 *   - note            → หมายเหตุ (ไม่จำเป็น)
 *
 * ⚠️ สิ่งที่ลูกค้าไม่ต้อง (และไม่ควร) ส่งมา:
 *   ❌ totalAmount → Backend คำนวณเอง (ห้ามเชื่อราคาจาก Client!)
 *   ❌ status      → Backend ตั้งเป็น PENDING อัตโนมัติ
 *
 * 📘 Concept: @ValidateNested + @Type
 * → สำหรับ validate Object ที่ซ้อนอยู่ใน Array
 * → @ValidateNested({ each: true }) = validate ทุกตัวใน Array
 * → @Type(() => Class) = บอก class-transformer ว่าต้องแปลงเป็น class ไหน
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsEnum,
  IsArray,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from "class-validator";
import { Type } from "class-transformer";
import { PaymentMethod } from "../enums/payment-method.enum";
import { CreateOrderItemDto } from "./create-order-item.dto";

export class CreateOrderDto {
  // ─────────────────────────────────────────────────────────────────
  // 📌 TODO [pockypycok-02]: ตรวจสอบว่า decorators ด้านล่างครบถ้วน
  // ─────────────────────────────────────────────────────────────────
  // 💡 ทุก field ต้องมี:
  //    1. @ApiProperty() → สำหรับเอกสาร Swagger
  //    2. Validation decorators → สำหรับตรวจสอบข้อมูล
  //
  // 📖 ดู pattern จาก CreateProductDto เป็นตัวอย่าง
  // ─────────────────────────────────────────────────────────────────

  @ApiProperty({ description: "รหัสลูกค้า", example: "CUST-001" })
  @IsString()
  customerId!: string;

  /**
   * รายการสินค้า — ต้องมีอย่างน้อย 1 รายการ
   *
   * 📘 Concept: Nested Validation
   *   @IsArray()                    → ต้องเป็น Array
   *   @ArrayMinSize(1)              → Array ต้องมีอย่างน้อย 1 ตัว
   *   @ValidateNested({ each: true }) → validate ทุกตัวใน Array
   *   @Type(() => CreateOrderItemDto) → แปลง plain object → class instance
   */
  @ApiProperty({
    description: "รายการสินค้า (อย่างน้อย 1 รายการ)",
    type: [CreateOrderItemDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ApiProperty({
    description: "วิธีชำระเงิน",
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsEnum(PaymentMethod)
  paymentMethod!: PaymentMethod;

  @ApiProperty({
    description: "ที่อยู่จัดส่ง",
    example: "123 ถนนสุขุมวิท กรุงเทพฯ 10110",
  })
  @IsString()
  shippingAddress!: string;

  @ApiPropertyOptional({
    description: "หมายเหตุเพิ่มเติม",
    example: "ส่งช่วงเย็น",
  })
  @IsOptional()
  @IsString()
  note?: string;
}
