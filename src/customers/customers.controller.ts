import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiResponse as SwaggerResponse,
  ApiTags,
} from "@nestjs/swagger";
import { ApiResponse } from "../common/interfaces/api-response.interface";
import { Customer } from "./entities/customer.entity";
import { CustomersService } from "./customers.service";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { PatchCustomerDto } from "./dto/patch-customer.dto";

@ApiTags("Customers")
@Controller("customers")
export class CustomersController {
  constructor(private readonly customersService: CustomersService) { }

  @Get("insights/top-buyers")
  @ApiOperation({ summary: "Top customers by spending" })
  @SwaggerResponse({ status: 200, description: "สำเร็จ" })
  async topBuyers(
    @Query("limit") limit?: string,
  ): Promise<ApiResponse<unknown[]>> {
    const data = await this.customersService.getTopBuyers(Number(limit ?? 5));
    return {
      success: true,
      message: "Top buyers retrieved successfully",
      data,
    };
  }



  @Get()
  @ApiOperation({ summary: "Get all customers" })
  @SwaggerResponse({ status: 200, description: "สำเร็จ" })
  async findAll(): Promise<ApiResponse<Customer[]>> {
    const customers = await this.customersService.findAll();
    return {
      success: true,
      message: "Customers retrieved successfully",
      data: customers,
    };
  }

  @Get(":id/orders")
  @ApiOperation({ summary: "See what this customer has bought" })
  @SwaggerResponse({ status: 200, description: "สำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบลูกค้า" })
  async findOrders(@Param("id") id: string): Promise<ApiResponse<unknown>> {
    const details = await this.customersService.getOrdersByCustomer(id);
    return {
      success: true,
      message: "Customer order history retrieved successfully",
      data: details,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get customer by id" })
  @SwaggerResponse({ status: 200, description: "สำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบลูกค้า" })
  async findOne(@Param("id") id: string): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.findOne(id);
    return {
      success: true,
      message: "Customer retrieved successfully",
      data: customer,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Create customer" })
  @SwaggerResponse({ status: 201, description: "สร้างสำเร็จ" })
  @SwaggerResponse({ status: 400, description: "ข้อมูลไม่ถูกต้อง" })
  async create(@Body() dto: CreateCustomerDto): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.create(dto);
    return {
      success: true,
      message: "Customer created successfully",
      data: customer,
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "Update all customer fields" })
  @SwaggerResponse({ status: 200, description: "แก้ไขสำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบลูกค้า" })
  @SwaggerResponse({ status: 400, description: "ข้อมูลไม่ถูกต้อง" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.update(id, dto);
    return {
      success: true,
      message: "Customer updated successfully",
      data: customer,
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update some customer fields" })
  @SwaggerResponse({ status: 200, description: "แก้ไขสำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบลูกค้า" })
  @SwaggerResponse({ status: 400, description: "ข้อมูลไม่ถูกต้อง" })
  async patch(
    @Param("id") id: string,
    @Body() dto: PatchCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.patch(id, dto);
    return {
      success: true,
      message: "Customer patched successfully",
      data: customer,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete customer (only if no order history)" })
  @SwaggerResponse({ status: 200, description: "ลบสำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบลูกค้า" })
  @SwaggerResponse({ status: 400, description: "ลูกค้ามีประวัติการสั่งซื้อ" })
  async remove(@Param("id") id: string): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.remove(id);
    return {
      success: true,
      message: "Customer deleted successfully",
      data: customer,
    };
  }
}
