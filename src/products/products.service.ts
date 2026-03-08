import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { ProductsRepository } from "./products.repository";
import { Product } from "./entities/product.entity";
import { ProductStatus } from "./enums/product-status.enum";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { PatchProductDto } from "./dto/patch-product.dto";
import { OrdersRepository } from "../orders/orders.repository";
import { CustomersRepository } from "../customers/customers.repository";

@Injectable()
export class ProductsService {
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly customersRepository: CustomersRepository,
  ) {}

  async findAll(): Promise<Product[]> {
    return this.productsRepository.findAll();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findById(id);
    if (!product) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const existingSku = await this.productsRepository.findBySku(dto.sku);
    if (existingSku) {
      throw new BadRequestException("SKU already exists");
    }

    const now = new Date().toISOString();
    const product: Product = {
      id: uuidv4(),
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stockQuantity: dto.stockQuantity,
      sku: dto.sku,
      category: dto.category,
      brand: dto.brand,
      images: dto.images,
      weight: dto.weight ?? null,
      status: dto.status ?? ProductStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    return this.productsRepository.create(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.findOne(id);

    if (dto.sku !== existing.sku) {
      const existingSku = await this.productsRepository.findBySku(dto.sku);
      if (existingSku) {
        throw new BadRequestException("SKU already exists");
      }
    }

    const updated: Product = {
      ...existing,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      stockQuantity: dto.stockQuantity,
      sku: dto.sku,
      category: dto.category,
      brand: dto.brand,
      images: dto.images,
      weight: dto.weight ?? null,
      status: dto.status,
      updatedAt: new Date().toISOString(),
    };

    const result = await this.productsRepository.update(id, updated);
    if (!result) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }
    return result;
  }

  async patch(id: string, dto: PatchProductDto): Promise<Product> {
    const existing = await this.findOne(id);

    if (dto.sku !== undefined && dto.sku !== existing.sku) {
      const existingSku = await this.productsRepository.findBySku(dto.sku);
      if (existingSku) {
        throw new BadRequestException("SKU already exists");
      }
    }

    const definedUpdates = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );

    const patched: Product = {
      ...existing,
      ...definedUpdates,
      updatedAt: new Date().toISOString(),
    };

    const result = await this.productsRepository.update(id, patched);
    if (!result) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }
    return result;
  }

  async remove(id: string): Promise<Product> {
    await this.findOne(id);

    const deleted = await this.productsRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Product with id '${id}' not found`);
    }

    return deleted;
  }

  async deductStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);

    if (product.stockQuantity < quantity) {
      throw new BadRequestException(
        `Insufficient stock for '${product.name}' (available: ${product.stockQuantity}, requested: ${quantity})`,
      );
    }

    product.stockQuantity -= quantity;

    if (product.stockQuantity === 0) {
      product.status = ProductStatus.OUT_OF_STOCK;
    }

    product.updatedAt = new Date().toISOString();

    await this.productsRepository.update(productId, product);
    return product;
  }

  async restoreStock(productId: string, quantity: number): Promise<Product> {
    const product = await this.findOne(productId);

    product.stockQuantity += quantity;

    if (
      product.status === ProductStatus.OUT_OF_STOCK &&
      product.stockQuantity > 0
    ) {
      product.status = ProductStatus.ACTIVE;
    }

    product.updatedAt = new Date().toISOString();

    await this.productsRepository.update(productId, product);
    return product;
  }

  async findCustomersByProduct(productId: string): Promise<
    Array<{
      customerId: string;
      fullName: string;
      email: string;
      totalQuantity: number;
      totalSpent: number;
      orderCount: number;
      lastPurchasedAt: string | null;
    }>
  > {
    await this.findOne(productId);

    const [orders, customers] = await Promise.all([
      this.ordersRepository.findAll(),
      this.customersRepository.findAll(),
    ]);

    const customerMap = new Map(
      customers.map((customer) => [customer.id, customer]),
    );

    const grouped = new Map<
      string,
      {
        customerId: string;
        totalQuantity: number;
        totalSpent: number;
        orderCount: number;
        lastPurchasedAt: string | null;
      }
    >();

    for (const order of orders) {
      const orderItems = order.items.filter(
        (item) => item.productId === productId,
      );
      if (orderItems.length === 0) {
        continue;
      }

      const row = grouped.get(order.customerId) ?? {
        customerId: order.customerId,
        totalQuantity: 0,
        totalSpent: 0,
        orderCount: 0,
        lastPurchasedAt: null,
      };

      row.orderCount += 1;
      if (!row.lastPurchasedAt || row.lastPurchasedAt < order.placedAt) {
        row.lastPurchasedAt = order.placedAt;
      }

      for (const item of orderItems) {
        row.totalQuantity += item.quantity;
        row.totalSpent += item.subtotal;
      }

      grouped.set(order.customerId, row);
    }

    return [...grouped.values()]
      .map((row) => {
        const customer = customerMap.get(row.customerId);
        return {
          customerId: row.customerId,
          fullName: customer?.fullName ?? "Unknown customer",
          email: customer?.email ?? "-",
          totalQuantity: row.totalQuantity,
          totalSpent: row.totalSpent,
          orderCount: row.orderCount,
          lastPurchasedAt: row.lastPurchasedAt,
        };
      })
      .sort((a, b) => b.totalQuantity - a.totalQuantity);
  }

  async findMostBoughtProducts(limit = 10): Promise<
    Array<{
      productId: string;
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
      buyerCount: number;
    }>
  > {
    const orders = await this.ordersRepository.findAll();
    const grouped = new Map<
      string,
      {
        productId: string;
        productName: string;
        totalQuantity: number;
        totalRevenue: number;
        buyers: Set<string>;
      }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        const row = grouped.get(item.productId) ?? {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: 0,
          totalRevenue: 0,
          buyers: new Set<string>(),
        };
        row.totalQuantity += item.quantity;
        row.totalRevenue += item.subtotal;
        row.buyers.add(order.customerId);
        grouped.set(item.productId, row);
      }
    }

    return [...grouped.values()]
      .map((row) => ({
        productId: row.productId,
        productName: row.productName,
        totalQuantity: row.totalQuantity,
        totalRevenue: row.totalRevenue,
        buyerCount: row.buyers.size,
      }))
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, Math.max(1, limit));
  }
}
