import { Injectable } from "@nestjs/common";
import { join } from "path";
import { JsonFileRepository } from "../common/repositories/json-file.repository";
import { Order } from "./entities/order.entity";
import process from "node:process";

@Injectable()
export class OrdersRepository extends JsonFileRepository<Order> {
  constructor() {
    const dataDir = process.env.DATA_DIR ?? join(process.cwd(), "data");
    super(join(dataDir, "orders.json"));
  }
}
