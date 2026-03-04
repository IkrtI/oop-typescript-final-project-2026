/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 OOP Concept: Inheritance + Composition
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Order extends BaseEntity → สืบทอด id, createdAt, updatedAt
 * Order มี items: OrderItem[] → "Composition" (มีของอยู่ข้างใน)
 *
 * Inheritance = "เป็น" (Order เป็น Entity)
 * Composition = "มี" (Order มี OrderItems)
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

import { BaseEntity } from "../../common/entities/base.entity";
import { OrderItem } from "../interfaces/order-item.interface";
import { OrderStatus } from "../enums/order-status.enum";
import { PaymentMethod } from "../enums/payment-method.enum";

/**
 * Order Entity — คำสั่งซื้อในระบบ
 *
 * สืบทอดจาก BaseEntity → ได้ id, createdAt, updatedAt
 * ดูรายละเอียด attribute ทั้งหมดได้ที่ docs/data-model.md
 */
export class Order extends BaseEntity {
  /** รหัสลูกค้า */
  customerId!: string;

  /**
   * รายการสินค้าในออเดอร์
   * 📘 Composition: Order "มี" หลาย OrderItem อยู่ข้างใน
   */
  items!: OrderItem[];

  /** ยอดรวมทั้งหมด (คำนวณโดย Backend เท่านั้น!) */
  totalAmount!: number;

  /** สถานะออเดอร์ (State Machine) */
  status!: OrderStatus;

  /** วิธีชำระเงิน */
  paymentMethod!: PaymentMethod;

  /** ที่อยู่จัดส่ง */
  shippingAddress!: string;

  /** เลขพัสดุ (มีค่าเมื่อสถานะเป็น SHIPPED) */
  trackingNumber!: string | null;

  /** หมายเหตุจากลูกค้า */
  note!: string | null;

  /** เวลาสั่งซื้อ (ISO 8601) */
  placedAt!: string;
}
