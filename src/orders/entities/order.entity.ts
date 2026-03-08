import { BaseEntity } from "../../common/entities/base.entity";
import { OrderItem } from "../interfaces/order-item.interface";
import { OrderStatus } from "../enums/order-status.enum";
import { PaymentMethod } from "../enums/payment-method.enum";

export class Order extends BaseEntity {
  customerId!: string;

  items!: OrderItem[];

  totalAmount!: number;

  status!: OrderStatus;

  paymentMethod!: PaymentMethod;

  shippingAddress!: string;

  trackingNumber!: string | null;

  note!: string | null;

  placedAt!: string;
}
