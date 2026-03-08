import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsEnum, IsOptional } from "class-validator";
import { OrderStatus } from "../enums/order-status.enum";

export class PatchOrderDto {
  @ApiPropertyOptional({
    description: "เปลี่ยนสถานะออเดอร์",
    enum: OrderStatus,
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiPropertyOptional({
    description: "เลขพัสดุ (ใช้ตอนจัดส่ง)",
    example: "TH999888777",
  })
  @IsOptional()
  @IsString()
  trackingNumber?: string;

  @ApiPropertyOptional({
    description: "หมายเหตุ",
    example: "ลูกค้าขอเปลี่ยนที่อยู่",
  })
  @IsOptional()
  @IsString()
  note?: string;
}
