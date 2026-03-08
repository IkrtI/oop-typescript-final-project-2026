import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse as SwaggerResponse,
} from "@nestjs/swagger";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PatchProductDto } from "./dto/patch-product.dto";
import { Product } from "./entities/product.entity";
import { ApiResponse } from "../common/interfaces/api-response.interface";

@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("insights/most-bought")
  @ApiOperation({ summary: "สินค้ายอดนิยมจากประวัติการสั่งซื้อ" })
  @SwaggerResponse({ status: 200, description: "สำเร็จ" })
  async mostBoughtInsights(
    @Query("limit") limit?: string,
  ): Promise<ApiResponse<unknown[]>> {
    const ordered = await this.productsService.findMostBoughtProducts(
      Number(limit ?? 10),
    );
    return {
      success: true,
      message: "Most bought insights retrieved successfully",
      data: ordered,
    };
  }

  @Get()
  @ApiOperation({ summary: "ดึงสินค้าทั้งหมด" })
  @SwaggerResponse({ status: 200, description: "สำเร็จ" })
  async findAll(): Promise<ApiResponse<Product[]>> {
    const products = await this.productsService.findAll();

    return {
      success: true,
      message: "Products retrieved successfully",
      data: products,
    };
  }

  @Get(":id")
  @ApiOperation({ summary: "ดึงสินค้าตาม ID" })
  @SwaggerResponse({ status: 200, description: "สำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบสินค้า" })
  async findOne(@Param("id") id: string): Promise<ApiResponse<Product>> {
    const product = await this.productsService.findOne(id);
    return {
      success: true,
      message: "Product retrieved successfully",
      data: product,
    };
  }

  @Get(":id/customers")
  @ApiOperation({ summary: "ดูว่าสินค้าชิ้นนี้ถูกซื้อโดยใครบ้าง" })
  @SwaggerResponse({ status: 200, description: "สำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบสินค้า" })
  async findCustomersByProduct(
    @Param("id") id: string,
  ): Promise<ApiResponse<unknown[]>> {
    const result = await this.productsService.findCustomersByProduct(id);
    return {
      success: true,
      message: "Customers by product retrieved successfully",
      data: result,
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "สร้างสินค้าใหม่" })
  @SwaggerResponse({ status: 201, description: "สร้างสำเร็จ" })
  @SwaggerResponse({ status: 400, description: "ข้อมูลไม่ถูกต้อง" })
  async create(@Body() dto: CreateProductDto): Promise<ApiResponse<Product>> {
    const product = await this.productsService.create(dto);
    return {
      success: true,
      message: "Product created successfully",
      data: product,
    };
  }

  @Put(":id")
  @ApiOperation({ summary: "แก้ไขสินค้าทั้งหมด (PUT)" })
  @SwaggerResponse({ status: 200, description: "แก้ไขสำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบสินค้า" })
  @SwaggerResponse({ status: 400, description: "ข้อมูลไม่ถูกต้อง" })
  async update(
    @Param("id") id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.update(id, dto);
    return {
      success: true,
      message: "Product updated successfully",
      data: product,
    };
  }

  @Patch(":id")
  @ApiOperation({ summary: "แก้ไขสินค้าบางส่วน (PATCH)" })
  @SwaggerResponse({ status: 200, description: "แก้ไขสำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบสินค้า" })
  @SwaggerResponse({ status: 400, description: "ข้อมูลไม่ถูกต้อง" })
  async patch(
    @Param("id") id: string,
    @Body() dto: PatchProductDto,
  ): Promise<ApiResponse<Product>> {
    const product = await this.productsService.patch(id, dto);
    return {
      success: true,
      message: "Product patched successfully",
      data: product,
    };
  }

  @Delete(":id")
  @ApiOperation({ summary: "ลบสินค้า" })
  @SwaggerResponse({ status: 200, description: "ลบสำเร็จ" })
  @SwaggerResponse({ status: 404, description: "ไม่พบสินค้า" })
  async remove(@Param("id") id: string): Promise<ApiResponse<Product>> {
    const product = await this.productsService.remove(id);
    return {
      success: true,
      message: "Product deleted successfully",
      data: product,
    };
  }
}
