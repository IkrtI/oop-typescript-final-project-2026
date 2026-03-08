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
  @ApiProperty({ description: "รหัสลูกค้า", example: "CUST-001" })
  @IsString()
  customerId!: string;

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
