/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 TypeScript Concept: Generic Interface (อินเทอร์เฟซแบบเจเนริก)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * ลองจินตนาการว่า API Response เหมือนกับ "กล่องพัสดุ" ที่ส่งของให้ลูกค้า
 * ทุกกล่องต้องมี:
 *   - success  → สะท้อนว่าสินค้าถูกต้องหรือไม่ (boolean)
 *   - message  → กระดาษหมายเหตุในกล่อง (string)
 *   - data     → ของที่อยู่ข้างในกล่อง (ชนิดอะไรก็ได้ → ใช้ Generic <T>)
 *
 * 🔑 Keyword: "<T>" คือ Generic Type Parameter
 *    → เหมือนตัวแปรของ "ชนิดข้อมูล" ที่ยังไม่ระบุ
 *    → เวลาใช้งานจริง เราค่อยกำหนดว่า T คืออะไร
 *    → เช่น ApiResponse<Product> หมายถึง data จะเป็น Product
 *         ApiResponse<Order[]> หมายถึง data จะเป็น Array ของ Order
 *
 * 👤 Assigned to: bouquetofroses (นภัทร์)
 * ═══════════════════════════════════════════════════════════════════════
 */

// ─────────────────────────────────────────────────────────────────────
// 📌 TODO [bouquetofroses-02]: สร้าง Generic Interface ชื่อ ApiResponse<T>
// ─────────────────────────────────────────────────────────────────────
// 💡 TypeScript Concept: "interface" กำหนดรูปทรง (shape) ของ Object
//    "Generic <T>" ทำให้ interface รองรับข้อมูลหลายชนิด
//
// 📖 Syntax:
//   export interface InterfaceName<T> {
//     propertyName: type;
//   }
//
// 🎯 ต้องมี 3 properties:
//   1. success: boolean      → true = สำเร็จ, false = ผิดพลาด
//   2. message: string       → ข้อความอธิบายผลลัพธ์
//   3. data: T | null        → ข้อมูลจริง หรือ null ถ้าไม่มี
//      (T | null หมายถึง: ค่าเป็นชนิด T หรือ null ก็ได้)
//
// ⬇️ เขียนโค้ดของคุณด้านล่าง ⬇️

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
