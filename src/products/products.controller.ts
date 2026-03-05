/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 NestJS Concept: Controller (ตัวรับคำร้อง HTTP)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Controller คือ "พนักงานเสิร์ฟ" ที่รับคำสั่งจากลูกค้า (HTTP Request)
 * แล้วส่งต่อให้เชฟ (Service) ทำงาน จากนั้นส่งผลลัพธ์กลับให้ลูกค้า
 *
 * 📘 NestJS Decorators:
 *   @Controller('products') → กำหนด route prefix เป็น /products
 *   @Get()   → HTTP GET
 *   @Post()  → HTTP POST
 *   @Put()   → HTTP PUT
 *   @Patch() → HTTP PATCH
 *   @Delete() → HTTP DELETE
 *   @Param('id') → ดึงค่า parameter จาก URL (เช่น /products/123 → id = '123')
 *   @Body()  → ดึง request body (ข้อมูลที่ลูกค้าส่งมา)
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

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

/**
 * @Controller('products') → ทุก endpoint ใน class นี้จะเริ่มต้นด้วย /products
 * @ApiTags('Products')    → จัดกลุ่มใน Swagger UI
 */
@ApiTags("Products")
@Controller("products")
export class ProductsController {
  /** Inject ProductsService ผ่าน Constructor */
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

  // ═══════════════════════════════════════════════════════════════════
  // ✅ ตัวอย่าง: GET /products — ดึงสินค้าทั้งหมด
  // ═══════════════════════════════════════════════════════════════════

  @Get()
  @ApiOperation({ summary: "ดึงสินค้าทั้งหมด" })
  @SwaggerResponse({ status: 200, description: "สำเร็จ" })
  async findAll(): Promise<ApiResponse<Product[]>> {
    // เรียก Service → ได้ข้อมูลกลับมา
    const products = await this.productsService.findAll();

    // สร้าง Standard Response แล้ว return
    return {
      success: true,
      message: "Products retrieved successfully",
      data: products,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // ✅ ตัวอย่าง: GET /products/:id — ดึงสินค้าตาม ID
  // ═══════════════════════════════════════════════════════════════════

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

  // ─────────────────────────────────────────────────────────────────
  // 📌 POST /products — สร้างสินค้าใหม่
  // ─────────────────────────────────────────────────────────────────
  // 💡 Hints:
  //   - ใช้ @Post() decorator
  //   - ใช้ @HttpCode(HttpStatus.CREATED) เพื่อส่ง status 201
  //   - รับข้อมูลจาก @Body() dto: CreateProductDto
  //   - เรียก this.productsService.create(dto)
  //   - return ApiResponse ที่มี message: 'Product created successfully'
  //
  // 📖 Pattern (ดูจากตัวอย่าง findAll ด้านบน):
  //   @Post()
  //   @HttpCode(HttpStatus.CREATED)
  //   @ApiOperation({ summary: '...' })
  //   async create(@Body() dto: CreateProductDto): Promise<ApiResponse<Product>> {
  //     const product = await this.productsService.create(dto);
  //     return { success: true, message: '...', data: product };
  //   }
  //
  // ⬇️ เขียน endpoint ของคุณด้านล่าง ⬇️

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

  // ─────────────────────────────────────────────────────────────────
  // 📌 PUT /products/:id — แก้ไขสินค้าทั้งหมด
  // ─────────────────────────────────────────────────────────────────
  // 💡 Pattern เดียวกับ create แต่:
  //   - ใช้ @Put(':id')
  //   - รับ @Param('id') id: string และ @Body() dto: UpdateProductDto
  //   - เรียก this.productsService.update(id, dto)
  //   - return status 200 (ไม่ต้องใส่ @HttpCode เพราะ 200 เป็นค่าเริ่มต้น)
  //
  // ⬇️ เขียน endpoint ของคุณด้านล่าง ⬇️

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

  // ─────────────────────────────────────────────────────────────────
  // 📌 PATCH /products/:id — แก้ไขบางส่วน
  // ─────────────────────────────────────────────────────────────────
  // 💡 Pattern เดียวกับ update แต่:
  //   - ใช้ @Patch(':id')
  //   - รับ @Body() dto: PatchProductDto
  //   - เรียก this.productsService.patch(id, dto)
  //
  // ⬇️ เขียน endpoint ของคุณด้านล่าง ⬇️

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

  // ─────────────────────────────────────────────────────────────────
  // 📌 DELETE /products/:id — ลบสินค้า
  // ─────────────────────────────────────────────────────────────────
  // 💡 Pattern:
  //   - ใช้ @Delete(':id')
  //   - รับ @Param('id') id: string
  //   - เรียก this.productsService.remove(id)
  //   - return ApiResponse ที่มี data เป็น product ที่ลบไป
  //
  // ⬇️ เขียน endpoint ของคุณด้านล่าง ⬇️

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
