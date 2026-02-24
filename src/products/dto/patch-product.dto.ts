/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 Concept: PatchProductDto — DTO สำหรับ PATCH (แก้ไขบางส่วน)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * PATCH = "แก้เฉพาะส่วนที่ต้องการ"
 * → ทุก field เป็น Optional (ใส่ @IsOptional())
 * → ส่งแค่ field ที่ต้องการเปลี่ยนก็พอ
 *
 * 📖 ตัวอย่างการใช้งาน:
 *   PATCH /products/123 { "price": 299 }
 *   → แก้แค่ราคา field อื่นยังเหมือนเดิม
 *
 *   PATCH /products/123 { "status": "DISCONTINUED" }
 *   → แก้แค่สถานะ field อื่นยังเหมือนเดิม
 *
 * 👤 Assigned to: Lukazx15 (ณัฐนันท์)
 * ═══════════════════════════════════════════════════════════════════════
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
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
} from 'class-validator';
import { ProductCategory } from '../enums/product-category.enum';
import { ProductStatus } from '../enums/product-status.enum';

/**
 * PatchProductDto — ใช้สำหรับ PATCH /products/:id
 *
 * ทุก field มี @IsOptional() → ไม่จำเป็นต้องส่งมา
 * แต่ถ้าส่งมา → ต้องผ่าน validation เหมือนเดิม
 */
export class PatchProductDto {
  @ApiPropertyOptional({ description: 'ชื่อสินค้า', minLength: 3 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({ description: 'รายละเอียดสินค้า' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'ราคาต่อหน่วย (> 0)' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ description: 'จำนวนสต็อก (>= 0)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ description: 'SKU (ไม่ซ้ำกัน)' })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: 'หมวดหมู่', enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ description: 'ยี่ห้อ' })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: 'รูปภาพ (Array ของ URL)',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ description: 'น้ำหนัก (kg)' })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: 'สถานะสินค้า', enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
