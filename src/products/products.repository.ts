import { Injectable } from "@nestjs/common";
import { join } from "node:path";
import { JsonFileRepository } from "../common/repositories/json-file.repository";
import { Product } from "./entities/product.entity";
import process from "node:process";

@Injectable()
export class ProductsRepository extends JsonFileRepository<Product> {
  constructor() {
    const dataDir = process.env.DATA_DIR ?? join(process.cwd(), "data");

    super(join(dataDir, "products.json"));
  }

  async findBySku(sku: string, excludeId?: string): Promise<Product | null> {
    const all = await this.findAll();
    return all.find((p) => p.sku === sku && p.id !== excludeId) ?? null;
  }
}
