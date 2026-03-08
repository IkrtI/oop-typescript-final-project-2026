/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 OOP Concept: Inheritance + Dependency Injection
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ProductsRepository สืบทอดจาก JsonFileRepository<Product>
 * → ได้ CRUD methods ทั้งหมดมาฟรี! (findAll, findById, create, update, delete)
 *
 * @Injectable() บอก NestJS ว่า:
 * "class นี้สามารถ inject (ฉีด) เข้าไปใน class อื่นได้"
 * → NestJS จะสร้าง instance ให้อัตโนมัติ (Singleton Pattern)
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

import { Injectable } from "@nestjs/common";
import { join } from "node:path";
import { JsonFileRepository } from "../common/repositories/json-file.repository";
import { Product } from "./entities/product.entity";
import process from "node:process";

@Injectable()
export class ProductsRepository extends JsonFileRepository<Product> {
  constructor() {
    const dataDir = process.env.DATA_DIR ?? join(process.cwd(), "data");
    // super() เรียก constructor ของ class แม่ (JsonFileRepository)
    // ส่ง path ไปยังไฟล์ JSON ที่เก็บข้อมูลสินค้า
    super(join(dataDir, "products.json"));
  }

  /**
   * ค้นหาสินค้าด้วย SKU — ใช้แทน findAll() + some() เพื่อ efficiency
   * คืน Product ถ้าเจอ, null ถ้าไม่เจอ
   */
  async findBySku(sku: string, excludeId?: string): Promise<Product | null> {
    const all = await this.findAll();
    return all.find((p) => p.sku === sku && p.id !== excludeId) ?? null;
  }
}
