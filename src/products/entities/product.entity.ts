/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 OOP Concept: Inheritance (การสืบทอด)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Product "extends" BaseEntity หมายความว่า:
 * Product สืบทอดคุณสมบัติทั้งหมดจาก BaseEntity (id, createdAt, updatedAt)
 * แล้วเพิ่มคุณสมบัติเฉพาะของตัวเองเข้าไป (name, price, sku, ...)
 *
 * เปรียบเสมือน:
 *   BaseEntity = แม่พิมพ์พื้นฐาน (มีรหัส, วันที่)
 *   Product    = แม่พิมพ์สินค้า (มีทุกอย่างจากพื้นฐาน + ชื่อ, ราคา, สต็อก)
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

import { BaseEntity } from '../../common/entities/base.entity';
import { ProductCategory } from '../enums/product-category.enum';
import { ProductStatus } from '../enums/product-status.enum';

/**
 * Product Entity — สินค้าในระบบร้านค้าออนไลน์
 *
 * สืบทอดจาก BaseEntity → ได้ id, createdAt, updatedAt มาอัตโนมัติ
 * ดูรายละเอียด attribute ทั้งหมดได้ที่ docs/data-model.md
 */
export class Product extends BaseEntity {
  /** ชื่อสินค้า (ต้องมีอย่างน้อย 3 ตัวอักษร) */
  name!: string;

  /** รายละเอียดสินค้า */
  description!: string;

  /** ราคาต่อหน่วย (ต้องมากกว่า 0) */
  price!: number;

  /** จำนวนสต็อกคงเหลือ (ต้อง >= 0) */
  stockQuantity!: number;

  /** Stock Keeping Unit — รหัสสินค้าเฉพาะ (ห้ามซ้ำกัน!) */
  sku!: string;

  /**
   * หมวดหมู่สินค้า
   * 📘 ใช้ Enum เพื่อจำกัดค่าที่เป็นไปได้
   * → ป้องกันการใส่ค่าอื่นที่ไม่ถูกต้อง
   */
  category!: ProductCategory;

  /** ยี่ห้อสินค้า */
  brand!: string;

  /** ลิงก์รูปภาพ (เป็น Array ของ URL) */
  images!: string[];

  /** น้ำหนัก (kg) — ไม่จำเป็นต้องมี (Optional) */
  weight!: number | null;

  /** สถานะการขาย (ACTIVE, OUT_OF_STOCK, DISCONTINUED) */
  status!: ProductStatus;
}
