/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 Concept: DTO — Data Transfer Object (วัตถุส่งผ่านข้อมูล)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * DTO เปรียบเสมือน "ใบสั่งซื้อ" ที่ลูกค้ากรอก
 * ก่อนที่ร้านจะรับออเดอร์ ต้องตรวจสอบว่า:
 *   - กรอกชื่อสินค้าหรือยัง? (required field)
 *   - ราคาเป็นตัวเลขจริงมั้ย? (type validation)
 *   - หมวดหมู่ถูกต้องมั้ย? (enum validation)
 *
 * 📘 Library: class-validator
 * → ใช้ Decorator (เช่น @IsString(), @IsNumber())
 * → ติดไว้บน property เพื่อตรวจสอบข้อมูลอัตโนมัติ
 *
 * 📘 Library: @nestjs/swagger - @ApiProperty()
 * → ใช้ระบุข้อมูลสำหรับเอกสาร Swagger UI
 * → ทำให้คนอ่าน API doc รู้ว่าต้องส่งอะไรมา
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsInt,
  IsEnum,
  IsArray,
  IsUrl,
  IsOptional,
  MinLength,
  Min,
  IsPositive,
  ArrayMinSize,
} from "class-validator";
import { ProductCategory } from "../enums/product-category.enum";
import { ProductStatus } from "../enums/product-status.enum";

/**
 * CreateProductDto — DTO สำหรับสร้างสินค้าใหม่ (POST /products)
 *
 * ทุก field ที่ required ต้องมี validation decorator
 * ถ้าข้อมูลไม่ผ่าน → NestJS จะส่ง 400 Bad Request อัตโนมัติ
 */
export class CreateProductDto {
  // ─────────────────────────────────────────────────────────────────
  // 📌 เพิ่ม Validation Decorators
  // ─────────────────────────────────────────────────────────────────
  // 💡 ดู pattern จากตัวอย่าง name ด้านล่างนี้ แล้วทำแบบเดียวกัน
  //    สำหรับ field อื่นๆ
  //
  // 📖 Decorator ที่ใช้บ่อย:
  //   @IsString()       → ตรวจว่าเป็น string
  //   @IsNumber()       → ตรวจว่าเป็นตัวเลข
  //   @IsInt()          → ตรวจว่าเป็นจำนวนเต็ม
  //   @IsPositive()     → ตรวจว่ามากกว่า 0
  //   @Min(n)           → ตรวจว่า >= n
  //   @MinLength(n)     → ตรวจว่า string ยาวอย่างน้อย n ตัวอักษร
  //   @IsEnum(EnumType) → ตรวจว่าค่าอยู่ใน Enum
  //   @IsArray()        → ตรวจว่าเป็น Array
  //   @IsUrl({}, { each: true }) → ตรวจว่าทุกตัวใน Array เป็น URL
  //   @IsOptional()     → field นี้ไม่จำเป็นต้องส่งมา
  //   @ArrayMinSize(1)  → Array ต้องมีอย่างน้อย 1 ตัว
  // ─────────────────────────────────────────────────────────────────

  // ✅ ตัวอย่าง: name field พร้อม validation decorators
  @ApiProperty({
    description: "ชื่อสินค้า (อย่างน้อย 3 ตัวอักษร)",
    example: "iPhone 16 Pro",
    minLength: 3,
  })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({
    description: "รายละเอียดสินค้า",
    example: "สมาร์ทโฟนรุ่นล่าสุดจาก Apple",
  })
  @IsString()
  description!: string;

  // 🎯 price: ต้องเป็นตัวเลข และมากกว่า 0
  @ApiProperty({ description: "ราคาต่อหน่วย (> 0)", example: 39900 })
  @IsNumber()
  @IsPositive()
  price!: number;

  // 🎯 stockQuantity: ต้องเป็นจำนวนเต็ม และ >= 0
  @ApiProperty({ description: "จำนวนสต็อก (>= 0)", example: 100 })
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  // 🎯 sku: ต้องเป็น string (รหัส SKU ที่ไม่ซ้ำกัน)
  @ApiProperty({
    description: "Stock Keeping Unit (ไม่ซ้ำกัน)",
    example: "IP16PRO-256-BLK",
  })
  @IsString()
  sku!: string;

  // 🎯 category: ต้องเป็นค่าใน ProductCategory enum
  @ApiProperty({
    description: "หมวดหมู่สินค้า",
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
  })
  @IsEnum(ProductCategory)
  category!: ProductCategory;

  // 🎯 brand: ต้องเป็น string
  @ApiProperty({ description: "ยี่ห้อสินค้า", example: "Apple" })
  @IsString()
  brand!: string;

  // 🎯 images: ต้องเป็น Array ของ URL strings
  @ApiProperty({
    description: "รูปภาพสินค้า (Array ของ URL)",
    example: ["https://example.com/iphone.jpg"],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images!: string[];

  // 🎯 weight: ไม่จำเป็น (Optional), ถ้ามีต้องเป็นตัวเลข
  @ApiPropertyOptional({ description: "น้ำหนัก (kg)", example: 0.187 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  // 🎯 status: ไม่จำเป็น (Optional), ถ้ามีต้องเป็นค่าใน ProductStatus enum
  //    ถ้าไม่ส่งมา → Service จะตั้งค่าเริ่มต้นเป็น ACTIVE
  @ApiPropertyOptional({
    description: "สถานะสินค้า (ถ้าไม่ระบุ = ACTIVE)",
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
