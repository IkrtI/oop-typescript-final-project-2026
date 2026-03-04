/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 OrdersRepository — คลังข้อมูลออเดอร์
 * ═══════════════════════════════════════════════════════════════════════
 *
 * สืบทอดจาก JsonFileRepository<Order>
 * → ได้ CRUD methods ทั้งหมดมาอัตโนมัติ
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

import { Injectable } from "@nestjs/common";
import { join } from "path";
import { JsonFileRepository } from "../common/repositories/json-file.repository";
import { Order } from "./entities/order.entity";

@Injectable()
export class OrdersRepository extends JsonFileRepository<Order> {
  constructor() {
    super(join(process.cwd(), "data", "orders.json"));
  }
}
