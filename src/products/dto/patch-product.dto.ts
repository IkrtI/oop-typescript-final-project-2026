import { ApiPropertyOptional } from "@nestjs/swagger";
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

export class PatchProductDto {
  @ApiPropertyOptional({ description: "ชื่อสินค้า", minLength: 3 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  name?: string;

  @ApiPropertyOptional({ description: "รายละเอียดสินค้า" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "ราคาต่อหน่วย (> 0)" })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  price?: number;

  @ApiPropertyOptional({ description: "จำนวนสต็อก (>= 0)" })
  @IsOptional()
  @IsInt()
  @Min(0)
  stockQuantity?: number;

  @ApiPropertyOptional({ description: "SKU (ไม่ซ้ำกัน)" })
  @IsOptional()
  @IsString()
  sku?: string;

  @ApiPropertyOptional({ description: "หมวดหมู่", enum: ProductCategory })
  @IsOptional()
  @IsEnum(ProductCategory)
  category?: ProductCategory;

  @ApiPropertyOptional({ description: "ยี่ห้อ" })
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({
    description: "รูปภาพ (Array ของ URL)",
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images?: string[];

  @ApiPropertyOptional({ description: "น้ำหนัก (kg)" })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiPropertyOptional({ description: "สถานะสินค้า", enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;
}
