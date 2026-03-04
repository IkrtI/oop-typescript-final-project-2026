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
} from '@nestjs/common';
import { ApiOperation, ApiResponse as SwaggerResponse, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../common/interfaces/api-response.interface';
import { Customer } from './entities/customer.entity';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PatchCustomerDto } from './dto/patch-customer.dto';

@ApiTags('Customers')
@Controller('customer')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Get('insights/top-buyers')
  @ApiOperation({ summary: 'Top customers by spending' })
  async topBuyers(@Query('limit') limit?: string): Promise<ApiResponse<any[]>> {
    const data = await this.customersService.getTopBuyers(Number(limit ?? 5));
    return {
      success: true,
      message: 'Top buyers retrieved successfully',
      data,
    };
  }

  @Get('insights/most-bought-products')
  @ApiOperation({ summary: 'Most bought products from orders history' })
  async mostBoughtProducts(@Query('limit') limit?: string): Promise<ApiResponse<any[]>> {
    const data = await this.customersService.getProductsMostBought(Number(limit ?? 5));
    return {
      success: true,
      message: 'Most bought products retrieved successfully',
      data,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get all customers' })
  async findAll(): Promise<ApiResponse<Customer[]>> {
    const customers = await this.customersService.findAll();
    return {
      success: true,
      message: 'Customers retrieved successfully',
      data: customers,
    };
  }

  @Get(':id/orders')
  @ApiOperation({ summary: 'See what this customer has bought' })
  async findOrders(@Param('id') id: string): Promise<ApiResponse<any>> {
    const details = await this.customersService.getOrdersByCustomer(id);
    return {
      success: true,
      message: 'Customer order history retrieved successfully',
      data: details,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get customer by id' })
  @SwaggerResponse({ status: 404, description: 'Customer not found' })
  async findOne(@Param('id') id: string): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.findOne(id);
    return {
      success: true,
      message: 'Customer retrieved successfully',
      data: customer,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create customer' })
  async create(@Body() dto: CreateCustomerDto): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.create(dto);
    return {
      success: true,
      message: 'Customer created successfully',
      data: customer,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update all customer fields' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.update(id, dto);
    return {
      success: true,
      message: 'Customer updated successfully',
      data: customer,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update some customer fields' })
  async patch(
    @Param('id') id: string,
    @Body() dto: PatchCustomerDto,
  ): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.patch(id, dto);
    return {
      success: true,
      message: 'Customer patched successfully',
      data: customer,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete customer (only if no order history)' })
  async remove(@Param('id') id: string): Promise<ApiResponse<Customer>> {
    const customer = await this.customersService.remove(id);
    return {
      success: true,
      message: 'Customer deleted successfully',
      data: customer,
    };
  }
}
