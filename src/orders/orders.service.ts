import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { v4 as uuidv4 } from "uuid";
import { OrdersRepository } from "./orders.repository";
import { ProductsService } from "../products/products.service";
import { Order } from "./entities/order.entity";
import { OrderItem } from "./interfaces/order-item.interface";
import {
  OrderStatus,
  VALID_ORDER_TRANSITIONS,
} from "./enums/order-status.enum";
import { ProductStatus } from "../products/enums/product-status.enum";
import { CreateOrderDto } from "./dto/create-order.dto";
import { PatchOrderDto } from "./dto/patch-order.dto";
import { CustomersService } from "../customers/customers.service";

@Injectable()
export class OrdersService {
  constructor(
    private readonly ordersRepository: OrdersRepository,
    private readonly productsService: ProductsService,
    private readonly customersService: CustomersService,
  ) {}

  async findAll(): Promise<Order[]> {
    return this.ordersRepository.findAll();
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findById(id);
    if (!order) {
      throw new NotFoundException(`Order with id '${id}' not found`);
    }
    return order;
  }

  async create(dto: CreateOrderDto): Promise<Order> {
    const hasCustomer = await this.customersService.hasCustomer(dto.customerId);
    if (!hasCustomer) {
      throw new BadRequestException(`Customer '${dto.customerId}' not found`);
    }

    const orderItems: OrderItem[] = [];
    let totalAmount = 0;
    const deductedItems: Array<{ productId: string; quantity: number }> = [];

    try {
      for (const item of dto.items) {
        let product;
        try {
          product = await this.productsService.findOne(item.productId);
        } catch {
          throw new BadRequestException(
            `Product '${item.productId}' not found`,
          );
        }

        if (product.status !== ProductStatus.ACTIVE) {
          throw new BadRequestException(
            `Product '${product.name}' is not available (${product.status})`,
          );
        }

        if (product.stockQuantity < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for '${product.name}'`,
          );
        }

        await this.productsService.deductStock(item.productId, item.quantity);
        deductedItems.push({
          productId: item.productId,
          quantity: item.quantity,
        });

        const subtotal = product.price * item.quantity;
        orderItems.push({
          productId: product.id,
          productName: product.name,
          priceAtPurchase: product.price,
          quantity: item.quantity,
          subtotal,
        });
        totalAmount += subtotal;
      }
    } catch (error) {
      for (const deducted of deductedItems) {
        await this.productsService.restoreStock(
          deducted.productId,
          deducted.quantity,
        );
      }
      throw error;
    }

    const now = new Date().toISOString();
    const order: Order = {
      id: uuidv4(),
      customerId: dto.customerId,
      items: orderItems,
      totalAmount,
      status: OrderStatus.PENDING,
      paymentMethod: dto.paymentMethod,
      shippingAddress: dto.shippingAddress,
      trackingNumber: null,
      note: dto.note ?? null,
      placedAt: now,
      createdAt: now,
      updatedAt: now,
    };

    return this.ordersRepository.create(order);
  }

  async patch(id: string, dto: PatchOrderDto): Promise<Order> {
    const existing = await this.findOne(id);

    if (
      existing.status === OrderStatus.COMPLETED ||
      existing.status === OrderStatus.CANCELLED
    ) {
      throw new BadRequestException(`Cannot update a ${existing.status} order`);
    }

    if (dto.status) {
      const allowedNextStates = VALID_ORDER_TRANSITIONS[existing.status];
      if (!allowedNextStates.includes(dto.status)) {
        throw new BadRequestException(
          `Cannot transition from ${existing.status} to ${dto.status}`,
        );
      }

      if (dto.status === OrderStatus.CANCELLED) {
        await this.restoreOrderStock(existing);
      }
    }

    const definedUpdates = Object.fromEntries(
      Object.entries(dto).filter(([, value]) => value !== undefined),
    );

    const updated: Order = {
      ...existing,
      ...definedUpdates,
      updatedAt: new Date().toISOString(),
    };

    const result = await this.ordersRepository.update(id, updated);
    if (!result) {
      throw new NotFoundException(`Order with id '${id}' not found`);
    }
    return result;
  }

  async remove(id: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.status !== OrderStatus.CANCELLED) {
      await this.restoreOrderStock(order);
    }

    const deleted = await this.ordersRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Order with id '${id}' not found`);
    }

    return deleted;
  }

  private async restoreOrderStock(order: Order): Promise<void> {
    for (const item of order.items) {
      await this.productsService.restoreStock(item.productId, item.quantity);
    }
  }
}
