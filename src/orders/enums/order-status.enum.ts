/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 Concept: State Machine (เครื่องจักรสถานะ)
 * ═══════════════════════════════════════════════════════════════════════
 *
 * OrderStatus ไม่ใช่แค่ Enum ธรรมดา — มันคือ "State Machine"
 * คือ สถานะจะเปลี่ยนได้เฉพาะตามเส้นทางที่กำหนดเท่านั้น
 *
 * เปรียบเสมือนพัสดุที่ส่ง:
 *   📦 PENDING (รอชำระ) → 💳 PAID (ชำระแล้ว) → 🚚 SHIPPED (จัดส่ง) → ✅ COMPLETED
 *            ↓                    ↓
 *         ❌ CANCELLED         ❌ CANCELLED
 *
 * ⚠️ กฎสำคัญ:
 *   - SHIPPED → ❌ ไม่สามารถ CANCELLED ได้ (ส่งของไปแล้ว!)
 *   - COMPLETED → ❌ ไม่สามารถเปลี่ยนสถานะอะไรได้อีก
 *   - CANCELLED → ❌ ไม่สามารถเปลี่ยนสถานะอะไรได้อีก
 *
 * ═══════════════════════════════════════════════════════════════════════
 */

export enum OrderStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/**
 * ═══════════════════════════════════════════════════════════════════════
 * 📘 State Transition Map — แผนที่การเปลี่ยนสถานะที่อนุญาต
 * ═══════════════════════════════════════════════════════════════════════
 *
 * 📘 TypeScript Concept: Record<K, V>
 * → Record คือ Object ที่ key เป็นชนิด K และ value เป็นชนิด V
 * → Record<OrderStatus, OrderStatus[]> หมายถึง:
 *    key = OrderStatus (เช่น PENDING)
 *    value = array ของ OrderStatus ที่เปลี่ยนไปได้ (เช่น [PAID, CANCELLED])
 */
export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],   // ← จุดสิ้นสุด ไม่มีทางไปต่อ
  [OrderStatus.CANCELLED]: [],   // ← จุดสิ้นสุด ไม่มีทางไปต่อ
};
