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

export class UpdateProductDto {
  @ApiProperty({ description: "ชื่อสินค้า", minLength: 3 })
  @IsString()
  @MinLength(3)
  name!: string;

  @ApiProperty({ description: "รายละเอียดสินค้า" })
  @IsString()
  description!: string;

  @ApiProperty({ description: "ราคาต่อหน่วย (> 0)" })
  @IsNumber()
  @IsPositive()
  price!: number;

  @ApiProperty({ description: "จำนวนสต็อก (>= 0)" })
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @ApiProperty({ description: "SKU (ไม่ซ้ำกัน)" })
  @IsString()
  sku!: string;

  @ApiProperty({ description: "หมวดหมู่", enum: ProductCategory })
  @IsEnum(ProductCategory)
  category!: ProductCategory;

  @ApiProperty({ description: "ยี่ห้อ" })
  @IsString()
  brand!: string;

  @ApiProperty({ description: "รูปภาพ (Array ของ URL)", type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsUrl({}, { each: true })
  images!: string[];

  @ApiPropertyOptional({ description: "น้ำหนัก (kg)" })
  @IsOptional()
  @IsNumber()
  weight?: number;

  @ApiProperty({ description: "สถานะสินค้า", enum: ProductStatus })
  @IsEnum(ProductStatus)
  status!: ProductStatus;
}
