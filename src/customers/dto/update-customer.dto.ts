import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { CustomerStatus } from '../enums/customer-status.enum';

export class UpdateCustomerDto {
  @ApiProperty({ example: 'Anan Wongchai' })
  @IsString()
  @Length(2, 120)
  fullName!: string;

  @ApiProperty({ example: 'anan@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '0812345678' })
  @IsString()
  @Length(6, 24)
  phone!: string;

  @ApiProperty({ example: '99 Rama 9 Road, Bangkok' })
  @IsString()
  @Length(5, 255)
  address!: string;

  @ApiProperty({ enum: CustomerStatus, example: CustomerStatus.ACTIVE })
  @IsEnum(CustomerStatus)
  status!: CustomerStatus;
}
