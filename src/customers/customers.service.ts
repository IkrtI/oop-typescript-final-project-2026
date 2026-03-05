import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { CustomersRepository } from "./customers.repository";
import { OrdersRepository } from "../orders/orders.repository";
import { ProductsRepository } from "../products/products.repository";
import { Customer } from "./entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { UpdateCustomerDto } from "./dto/update-customer.dto";
import { PatchCustomerDto } from "./dto/patch-customer.dto";
import { CustomerStatus } from "./enums/customer-status.enum";

@Injectable()
export class CustomersService {
  constructor(
    private readonly customersRepository: CustomersRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly productsRepository: ProductsRepository,
  ) {}

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.findAll();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findById(id);
    if (!customer) {
      throw new NotFoundException(`Customer with id '${id}' not found`);
    }
    return customer;
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    await this.ensureUniqueEmailAndPhone(dto.email, dto.phone);

    const now = new Date().toISOString();
    const customer: Customer = {
      id: randomUUID(),
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      address: dto.address,
      status: dto.status ?? CustomerStatus.ACTIVE,
      createdAt: now,
      updatedAt: now,
    };

    return this.customersRepository.create(customer);
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const existing = await this.findOne(id);
    await this.ensureUniqueEmailAndPhone(dto.email, dto.phone, existing.id);

    const updated: Customer = {
      ...existing,
      fullName: dto.fullName,
      email: dto.email.toLowerCase(),
      phone: dto.phone,
      address: dto.address,
      status: dto.status,
      updatedAt: new Date().toISOString(),
    };

    const result = await this.customersRepository.update(id, updated);
    if (!result) {
      throw new NotFoundException(`Customer with id '${id}' not found`);
    }
    return result;
  }

  async patch(id: string, dto: PatchCustomerDto): Promise<Customer> {
    const existing = await this.findOne(id);

    const nextEmail = dto.email ? dto.email.toLowerCase() : existing.email;
    const nextPhone = dto.phone ?? existing.phone;
    await this.ensureUniqueEmailAndPhone(nextEmail, nextPhone, existing.id);

    const patched: Customer = {
      ...existing,
      ...dto,
      email: nextEmail,
      updatedAt: new Date().toISOString(),
    };

    const result = await this.customersRepository.update(id, patched);
    if (!result) {
      throw new NotFoundException(`Customer with id '${id}' not found`);
    }
    return result;
  }

  async remove(id: string): Promise<Customer> {
    await this.findOne(id);

    const orders = await this.ordersRepository.findAll();
    if (orders.some((order) => order.customerId === id)) {
      throw new BadRequestException(
        "Customer has order history and cannot be deleted",
      );
    }

    const removed = await this.customersRepository.delete(id);
    if (!removed) {
      throw new NotFoundException(`Customer with id '${id}' not found`);
    }
    return removed;
  }

  async getOrdersByCustomer(id: string): Promise<{
    customer: Customer;
    orders: unknown[];
    summary: {
      totalOrders: number;
      totalSpent: number;
      distinctProducts: number;
      lastOrderAt: string | null;
      products: Array<{
        productId: string;
        productName: string;
        totalQuantity: number;
        totalSpent: number;
      }>;
    };
  }> {
    const customer = await this.findOne(id);
    const orders = (await this.ordersRepository.findAll())
      .filter((order) => order.customerId === id)
      .sort((a, b) => b.placedAt.localeCompare(a.placedAt));

    const productMap = new Map<
      string,
      {
        productId: string;
        productName: string;
        totalQuantity: number;
        totalSpent: number;
      }
    >();
    let totalSpent = 0;

    for (const order of orders) {
      totalSpent += order.totalAmount;
      for (const item of order.items) {
        const existingItem = productMap.get(item.productId) ?? {
          productId: item.productId,
          productName: item.productName,
          totalQuantity: 0,
          totalSpent: 0,
        };
        existingItem.totalQuantity += item.quantity;
        existingItem.totalSpent += item.subtotal;
        productMap.set(item.productId, existingItem);
      }
    }

    return {
      customer,
      orders,
      summary: {
        totalOrders: orders.length,
        totalSpent,
        distinctProducts: productMap.size,
        lastOrderAt: orders[0]?.placedAt ?? null,
        products: [...productMap.values()].sort(
          (a, b) => b.totalQuantity - a.totalQuantity,
        ),
      },
    };
  }

  async getTopBuyers(limit = 5): Promise<
    Array<{
      customerId: string;
      fullName: string;
      orderCount: number;
      totalSpent: number;
      lastOrderAt: string | null;
    }>
  > {
    const [customers, orders] = await Promise.all([
      this.customersRepository.findAll(),
      this.ordersRepository.findAll(),
    ]);

    const customerMap = new Map(
      customers.map((customer) => [customer.id, customer]),
    );
    const grouped = new Map<
      string,
      {
        customerId: string;
        orderCount: number;
        totalSpent: number;
        lastOrderAt: string | null;
      }
    >();

    for (const order of orders) {
      const row = grouped.get(order.customerId) ?? {
        customerId: order.customerId,
        orderCount: 0,
        totalSpent: 0,
        lastOrderAt: null,
      };
      row.orderCount += 1;
      row.totalSpent += order.totalAmount;
      if (!row.lastOrderAt || row.lastOrderAt < order.placedAt) {
        row.lastOrderAt = order.placedAt;
      }
      grouped.set(order.customerId, row);
    }

    return [...grouped.values()]
      .map((row) => ({
        ...row,
        fullName:
          customerMap.get(row.customerId)?.fullName ?? "Unknown customer",
      }))
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, Math.max(1, limit));
  }

  async hasCustomer(id: string): Promise<boolean> {
    const customer = await this.customersRepository.findById(id);
    return !!customer;
  }

  private async ensureUniqueEmailAndPhone(
    email: string,
    phone: string,
    ignoreId?: string,
  ): Promise<void> {
    const customers = await this.customersRepository.findAll();

    const duplicateEmail = customers.find(
      (customer) =>
        customer.email.toLowerCase() === email.toLowerCase() &&
        customer.id !== ignoreId,
    );
    if (duplicateEmail) {
      throw new BadRequestException("Email already exists");
    }

    const duplicatePhone = customers.find(
      (customer) => customer.phone === phone && customer.id !== ignoreId,
    );
    if (duplicatePhone) {
      throw new BadRequestException("Phone already exists");
    }
  }

  async getProductsMostBought(limit = 5): Promise<
    Array<{
      productId: string;
      productName: string;
      totalQuantity: number;
      totalRevenue: number;
      buyerCount: number;
    }>
  > {
    const [orders, products] = await Promise.all([
      this.ordersRepository.findAll(),
      this.productsRepository.findAll(),
    ]);
    const productsMap = new Map(
      products.map((product) => [product.id, product]),
    );

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
        row.productName =
          productsMap.get(item.productId)?.name ?? item.productName;
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
