# API Specification — E-commerce Basic (Model Set 5)

> เอกสาร API ครบถ้วนสามารถเข้าดูได้ที่ Swagger UI: `http://localhost:3000/api`

---

## Standard Response Format

ทุก API ใช้ Response Format เดียวกัน:

```json
{
  "success": true,
  "message": "ข้อความอธิบาย",
  "data": { ... }
}
```

---

## Products API

### GET /products
- **Description:** ดึงสินค้าทั้งหมด
- **Response:** `200 OK`

### GET /products/:id
- **Description:** ดึงรายละเอียดสินค้าตาม ID
- **Response:** `200 OK` / `404 Not Found`

### POST /products
- **Description:** ลงขายสินค้าใหม่
- **Response:** `201 Created` / `400 Bad Request`
- **Body:** `CreateProductDto`

### PUT /products/:id
- **Description:** แก้ไขข้อมูลสินค้าทั้งหมด
- **Response:** `200 OK` / `404 Not Found` / `400 Bad Request`
- **Body:** `UpdateProductDto`

### PATCH /products/:id
- **Description:** แก้ไขข้อมูลสินค้าบางส่วน (เช่น ราคา, สต็อก)
- **Response:** `200 OK` / `404 Not Found` / `400 Bad Request`
- **Body:** `PatchProductDto`

### DELETE /products/:id
- **Description:** ลบสินค้า
- **Response:** `200 OK` / `404 Not Found`

---

## Orders API

### GET /orders
- **Description:** ดูประวัติคำสั่งซื้อทั้งหมด
- **Response:** `200 OK`

### GET /orders/:id
- **Description:** ดูรายละเอียดคำสั่งซื้อ
- **Response:** `200 OK` / `404 Not Found`

### POST /orders
- **Description:** สั่งซื้อสินค้า (คำนวณเงิน + ตัดสต็อก)
- **Response:** `201 Created` / `400 Bad Request`
- **Body:** `CreateOrderDto`
- **Business Logic:**
  1. ตรวจสอบสินค้ามีอยู่จริง
  2. ตรวจสอบสต็อกเพียงพอ
  3. คำนวณราคาจาก Database (ห้ามเชื่อราคาจาก Client)
  4. ตัดสต็อกสินค้า
  5. บันทึกคำสั่งซื้อ

### PATCH /orders/:id
- **Description:** อัปเดตสถานะ (เช่น แจ้งเลขพัสดุ)
- **Response:** `200 OK` / `404 Not Found` / `400 Bad Request`
- **Body:** `PatchOrderDto`
- **Business Logic:** ตรวจสอบ State Transition ที่ถูกต้อง

### DELETE /orders/:id
- **Description:** ยกเลิกคำสั่งซื้อ (คืนสต็อกสินค้า)
- **Response:** `200 OK` / `404 Not Found`

---

## HTTP Status Codes

| Code | Description |
|------|-------------|
| `200` | OK — สำเร็จ (GET, PUT, PATCH, DELETE) |
| `201` | Created — สร้างข้อมูลสำเร็จ (POST) |
| `400` | Bad Request — ข้อมูลไม่ถูกต้อง / Validation Error |
| `404` | Not Found — ไม่พบข้อมูล |
