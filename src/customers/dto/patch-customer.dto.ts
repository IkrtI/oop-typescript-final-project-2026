import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString, Length } from "class-validator";
import { CustomerStatus } from "../enums/customer-status.enum";

export class PatchCustomerDto {
  @ApiPropertyOptional({ example: "Anan Wongchai" })
  @IsOptional()
  @IsString()
  @Length(2, 120)
  fullName?: string;

  @ApiPropertyOptional({ example: "anan@example.com" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: "0812345678" })
  @IsOptional()
  @IsString()
  @Length(6, 24)
  phone?: string;

  @ApiPropertyOptional({ example: "99 Rama 9 Road, Bangkok" })
  @IsOptional()
  @IsString()
  @Length(5, 255)
  address?: string;

  @ApiPropertyOptional({ enum: CustomerStatus, example: CustomerStatus.ACTIVE })
  @IsOptional()
  @IsEnum(CustomerStatus)
  status?: CustomerStatus;
}
