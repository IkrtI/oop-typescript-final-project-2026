# Data Model Documentation — E-commerce Basic (Model Set 5)

## Overview
ระบบร้านค้าออนไลน์พื้นฐาน ประกอบด้วย Core Model 2 ตัว คือ **Product** และ **Order**

---

## 1. Product Model

สินค้าในระบบ — มีข้อมูลครบถ้วนสำหรับการขายและการจัดการสต็อก

| # | Attribute | Type | Description | Category |
|---|-----------|------|-------------|----------|
| 1 | `id` | `string` (UUID) | รหัสสินค้า (Unique) | Identity |
| 2 | `name` | `string` | ชื่อสินค้า (min 3 chars) | Core Domain |
| 3 | `description` | `string` | รายละเอียดสินค้า | Core Domain |
| 4 | `price` | `number` | ราคาต่อหน่วย (> 0) | Core Domain |
| 5 | `stockQuantity` | `number` | จำนวนคงเหลือ (>= 0) | Core Domain |
| 6 | `sku` | `string` | Stock Keeping Unit (Unique) | Identity |
| 7 | `category` | `ProductCategory` | หมวดหมู่สินค้า (Enum) | Status/State |
| 8 | `brand` | `string` | ยี่ห้อสินค้า | Core Domain |
| 9 | `images` | `string[]` | ลิงก์รูปภาพ | Core Domain |
| 10 | `weight` | `number \| null` | น้ำหนัก kg (Optional) | Configuration |
| 11 | `status` | `ProductStatus` | สถานะการขาย (Enum) | Status/State |
| 12 | `createdAt` | `string` (ISO) | วันที่สร้าง | Timestamp |
| 13 | `updatedAt` | `string` (ISO) | วันที่แก้ไขล่าสุด | Timestamp |

### Enums

**ProductCategory:**
| Value | Description |
|-------|-------------|
| `ELECTRONICS` | อิเล็กทรอนิกส์ |
| `CLOTHING` | เสื้อผ้า |
| `HOME` | ของใช้ในบ้าน |
| `BEAUTY` | ความงาม |
| `OTHER` | อื่นๆ |

**ProductStatus:**
| Value | Description |
|-------|-------------|
| `ACTIVE` | พร้อมขาย |
| `OUT_OF_STOCK` | หมดชั่วคราว |
| `DISCONTINUED` | เลิกขาย |

---

## 2. Order Model

คำสั่งซื้อ — เก็บ Snapshot ของราคา ณ เวลาสั่งซื้อ

| # | Attribute | Type | Description | Category |
|---|-----------|------|-------------|----------|
| 1 | `id` | `string` (UUID) | เลขที่คำสั่งซื้อ (Unique) | Identity |
| 2 | `customerId` | `string` | รหัสลูกค้า | Relation |
| 3 | `items` | `OrderItem[]` | รายการสินค้า (Nested) | Core Domain |
| 4 | `totalAmount` | `number` | ยอดรวม (คำนวณ Backend) | Core Domain |
| 5 | `status` | `OrderStatus` | สถานะออเดอร์ (Enum) | Status/State |
| 6 | `paymentMethod` | `PaymentMethod` | วิธีชำระเงิน (Enum) | Configuration |
| 7 | `shippingAddress` | `string` | ที่อยู่จัดส่ง | Core Domain |
| 8 | `trackingNumber` | `string \| null` | เลขพัสดุ (Optional) | Core Domain |
| 9 | `note` | `string \| null` | หมายเหตุ (Optional) | Core Domain |
| 10 | `placedAt` | `string` (ISO) | เวลาสั่งซื้อ | Timestamp |
| 11 | `updatedAt` | `string` (ISO) | เวลาอัปเดต | Timestamp |

### Nested Interface: OrderItem

| Attribute | Type | Description |
|-----------|------|-------------|
| `productId` | `string` | อ้างอิง Product ID |
| `productName` | `string` | Snapshot ชื่อสินค้า |
| `priceAtPurchase` | `number` | Snapshot ราคา ณ ตอนซื้อ |
| `quantity` | `number` | จำนวนที่สั่ง |
| `subtotal` | `number` | price × quantity |

### Enums

**OrderStatus:**
| Value | Description |
|-------|-------------|
| `PENDING` | รอชำระเงิน |
| `PAID` | ชำระแล้ว (ตัดสต็อกแล้ว) |
| `SHIPPED` | จัดส่งแล้ว |
| `COMPLETED` | สำเร็จ |
| `CANCELLED` | ยกเลิก (คืนสต็อก) |

**PaymentMethod:**
| Value | Description |
|-------|-------------|
| `CREDIT_CARD` | บัตรเครดิต |
| `BANK_TRANSFER` | โอนเงิน |
| `COD` | เก็บเงินปลายทาง |

---

## 3. State Machine — Order Status Transitions

```
PENDING → PAID → SHIPPED → COMPLETED
  ↓         ↓
CANCELLED  CANCELLED
```

**Valid Transitions:**
- `PENDING` → `PAID`, `CANCELLED`
- `PAID` → `SHIPPED`, `CANCELLED`
- `SHIPPED` → `COMPLETED`

---

## 4. Business Rules

1. **Price Snapshot:** คำสั่งซื้อต้องเก็บราคา ณ เวลาสั่งซื้อ ห้ามใช้ราคาปัจจุบันของ Product
2. **Stock Deduction:** เมื่อสร้างคำสั่งซื้อ ต้องตัดสต็อกสินค้าทันที
3. **Stock Restoration:** เมื่อยกเลิกคำสั่งซื้อ ต้องคืนสต็อกสินค้า
4. **SKU Unique:** รหัส SKU ของสินค้าต้องไม่ซ้ำกัน
5. **Price Validation:** ราคาสินค้าต้องมากกว่า 0
6. **Stock Validation:** จำนวนสต็อกต้อง >= 0
7. **Total Calculation:** ยอดรวมคำนวณจาก Backend เท่านั้น
