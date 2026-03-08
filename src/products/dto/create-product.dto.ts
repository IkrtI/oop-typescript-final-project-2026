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

export class CreateProductDto {
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

  @ApiProperty({ description: "ราคาต่อหน่วย (> 0)", example: 39900 })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ description: "จำนวนสต็อก (>= 0)", example: 100 })
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @ApiProperty({
    description: "Stock Keeping Unit (ไม่ซ้ำกัน)",
    example: "IP16PRO-256-BLK",
  })
  @IsString()
  sku!: string;

  @ApiProperty({
    description: "หมวดหมู่สินค้า",
    enum: ProductCategory,
    example: ProductCategory.ELECTRONICS,
  })
  @IsEnum(ProductCategory)
  category!: ProductCategory;

  @ApiProperty({ description: "ยี่ห้อสินค้า", example: "Apple" })
  @IsString()
  brand!: string;

  @ApiProperty({
    description: "รูปภาพสินค้า (Array ของ URL)",
    example: ["https://example.com/iphone.jpg"],
    type: [String],
  })
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images!: string[];

  @ApiPropertyOptional({ description: "น้ำหนัก (kg)", example: 0.187 })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({
    description: "สถานะสินค้า (ถ้าไม่ระบุ = ACTIVE)",
    enum: ProductStatus,
    example: ProductStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
