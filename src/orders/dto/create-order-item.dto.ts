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
