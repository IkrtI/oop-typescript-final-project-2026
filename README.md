# E-commerce Basic API

REST API สำหรับโปรเจกต์วิชา OOP TypeScript 2026 พัฒนาด้วย NestJS โดยใช้ JSON file เป็นแหล่งเก็บข้อมูลหลัก และมีหน้า frontend แบบ static สำหรับทดลองใช้งานระบบผ่าน browser

โปรเจกต์นี้อยู่ใน Model Set 5: `E-commerce Basic`

## Overview

ระบบนี้จัดการ 3 โดเมนหลัก:

- `Products` สำหรับสินค้าและสต็อก
- `Orders` สำหรับคำสั่งซื้อและ state transition
- `Customers` สำหรับข้อมูลลูกค้าและประวัติการซื้อ

Business logic ที่สำคัญของระบบ:

- สร้าง order โดย snapshot ราคาสินค้า ณ เวลาซื้อ
- ตัดสต็อกอัตโนมัติเมื่อสร้าง order
- คืนสต็อกอัตโนมัติเมื่อ cancel หรือลบ order
- ตรวจ state transition ของ order ตามกฎที่กำหนด
- มี insight endpoints สำหรับ top buyers, most bought products และ product buyers

## Tech Stack

- NestJS
- TypeScript
- Swagger / OpenAPI
- class-validator + class-transformer
- JSON file persistence
- Jest + Supertest สำหรับ test

## Team

รายชื่อสมาชิกจาก `package.json`:

| Name | GitHub | Student ID |
|---|---|---|
| กริช เถกิงผล | `IkrtI` | 68010025 |
| นภัทร์ มะโนธรรม | `bouquetofroses` | 68010562 |
| ณัฐนันท์ พันเพชร์ | `Lukazx15` | 68010346 |
| ณัชชา วัฒนนันทอนันต์ | `pockypycok` | 68010312 |

## Project Structure

```text
.
├── data/                    # JSON data source สำหรับ runtime ปกติ
├── docs/                    # เอกสาร API, data model, UML
├── frontend/                # static dashboard
├── scripts/                 # utility scripts เช่น generate mock data
├── src/
│   ├── common/              # base entity, shared interfaces, generic repository
│   ├── customers/           # customer domain
│   ├── orders/              # order domain
│   ├── products/            # product domain
│   ├── app.module.ts
│   └── main.ts
├── subjects/                # requirement ของรายวิชา
├── test/                    # e2e tests + isolated test data
├── package.json
└── README.md
```

## Data Model

Core domain ของโจทย์คือ `Product` และ `Order` และใน implementation นี้มี `Customer` เพิ่มเข้ามาเพื่อรองรับการซื้อสินค้าและ analytics ข้ามโดเมน

### Product

- ข้อมูลหลัก: `name`, `description`, `price`, `stockQuantity`, `sku`, `brand`, `images`
- enum ที่ใช้: `ProductCategory`, `ProductStatus`
- กฎสำคัญ: SKU ต้องไม่ซ้ำ, ราคา > 0, stock ต้องไม่ติดลบ

### Order

- เก็บ `customerId`, `items`, `totalAmount`, `status`, `paymentMethod`, `shippingAddress`
- `items` เป็น snapshot ของชื่อสินค้าและราคา ณ เวลาซื้อ
- enum ที่ใช้: `OrderStatus`, `PaymentMethod`

### Customer

- ข้อมูลหลัก: `fullName`, `email`, `phone`, `address`, `status`
- ใช้เพื่อเชื่อม order history และ buyer insights

## Main Features

- CRUD ครบสำหรับ products
- CRUD ครบสำหรับ customers
- ดู orders ทั้งหมด, ดูรายตัว, สร้าง, patch, ลบ
- ป้องกันการลบ customer ที่มีประวัติการสั่งซื้อแล้ว
- แสดงสินค้ายอดนิยมจากประวัติการซื้อ
- แสดงลูกค้าที่เคยซื้อสินค้าตัวใดตัวหนึ่ง
- แสดง top buyers จากยอดใช้จ่ายรวม

## API Summary

### Products

- `GET /products`
- `GET /products/:id`
- `POST /products`
- `PUT /products/:id`
- `PATCH /products/:id`
- `DELETE /products/:id`
- `GET /products/:id/customers`
- `GET /products/insights/most-bought`

### Orders

- `GET /orders`
- `GET /orders/:id`
- `POST /orders`
- `PATCH /orders/:id`
- `DELETE /orders/:id`

### Customers

- `GET /customers`
- `GET /customers/:id`
- `POST /customers`
- `PUT /customers/:id`
- `PATCH /customers/:id`
- `DELETE /customers/:id`
- `GET /customers/:id/orders`
- `GET /customers/insights/top-buyers`

### Standard Response Format

ทุก endpoint ส่ง response ในรูปแบบเดียวกัน:

```ts
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
```

## Order Lifecycle

สถานะของ order ถูกควบคุมด้วย state machine:

```text
PENDING -> PAID -> SHIPPED -> COMPLETED
   |         |
   v         v
CANCELLED  CANCELLED
```

Transition ที่อนุญาต:

- `PENDING -> PAID`
- `PENDING -> CANCELLED`
- `PAID -> SHIPPED`
- `PAID -> CANCELLED`
- `SHIPPED -> COMPLETED`

## Validation and Business Rules

- ใช้ global `ValidationPipe` พร้อม `whitelist`, `forbidNonWhitelisted`, `transform`
- order ใหม่ต้องอ้างถึง customer ที่มีอยู่จริง
- สินค้าที่จะสั่งซื้อได้ต้องมีสถานะ `ACTIVE`
- ถ้าสต็อกไม่พอ จะ reject request ด้วย `400 Bad Request`
- ถ้าเกิด error ระหว่างสร้าง order หลังจากตัด stock ไปบางส่วน ระบบจะ rollback โดยคืน stock ที่ถูกตัดไปแล้ว
- ถ้า customer มี order history อยู่ จะลบไม่ได้

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run development server

```bash
npm run start:dev
```

แอปจะรันที่ `http://localhost:3000`

### 3. Open Swagger UI

```text
http://localhost:3000/api
```

### 4. Open frontend dashboard

เมื่อ backend รันอยู่ หน้า frontend จะถูก serve ที่:

```text
http://localhost:3000/app
```

หมายเหตุ: ในโค้ด `main.ts` มีการ map โฟลเดอร์ `frontend/` มาไว้ใต้ route `/app`

## Available Scripts

| Command | Description |
|---|---|
| `npm run start` | Run application |
| `npm run start:dev` | Run in watch mode |
| `npm run start:debug` | Run in debug + watch mode |
| `npm run build` | Build NestJS app |
| `npm run start:prod` | Run built app from `dist/` |
| `npm run lint` | Run ESLint with autofix |
| `npm run format` | Run ESLint + Prettier on source files |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run e2e tests |
| `npm run test:cov` | Run coverage |
| `npm run mock:generate` | Generate mock data |
| `npm run preview` | Run Wrangler preview |
| `npm run deploy` | Deploy with Wrangler |

## Testing

มี test แยกไว้ในโฟลเดอร์ `test/` พร้อมชุดข้อมูลเฉพาะสำหรับ e2e ทำให้สามารถทดสอบ flow หลักของระบบได้โดยไม่กระทบไฟล์ข้อมูล runtime ปกติ

ตัวอย่าง:

```bash
npm run test:e2e
```

## Documentation

เอกสารหลักของโปรเจกต์อยู่ในโฟลเดอร์ `docs/`

- `docs/api-specification.md` สรุป endpoint และ behavior หลัก
- `docs/data-model.md` อธิบาย data model และ business rules
- `docs/uml-diagrams.md` รวม UML ของระบบทั้ง architecture, class, sequence, state, activity และ persistence

เอกสารโจทย์จากรายวิชาอยู่ในโฟลเดอร์ `subjects/`

- `subjects/requirement.md`
- `subjects/models.md`
- `subjects/submission.md`
- `subjects/evaluation.md`

## Persistence Design

ระบบใช้ generic repository ชื่อ `JsonFileRepository<T>` เพื่อแยก business logic ออกจากการอ่านเขียนไฟล์ JSON โดยมีแนวคิดหลักดังนี้:

- lazy loading โหลดข้อมูลจากไฟล์เมื่อถูกเรียกใช้ครั้งแรก
- atomic write ผ่านไฟล์ `.tmp` แล้วค่อย rename
- write queue เพื่อหลีกเลี่ยงปัญหา concurrent write

## Notes

- โปรเจกต์นี้เน้น type safety และหลีกเลี่ยงการใช้ `any`
- route จริงของลูกค้าใช้ prefix `customers` ไม่ใช่ `customer`
- README นี้อธิบาย implementation ปัจจุบันของ repository นี้ ไม่ใช่ template กลางของรายวิชา

## License

ใช้สำหรับการศึกษาในรายวิชา OOP TypeScript 2026

โปรเจคนี้เป็น **Template สำหรับ Class Project** ในรายวิชาการพัฒนา Backend ด้วย NestJS Framework

**Repository:** [https://github.com/42bangkok-classroom/oop-typescript-final-project-2026](https://github.com/42bangkok-classroom/oop-typescript-final-project-2026)

วัตถุประสงค์ของโปรเจคนี้คือให้นักศึกษาฝึก:

* การออกแบบและพัฒนา REST API ตามมาตรฐาน
* การใช้ TypeScript อย่างปลอดภัย (Type-safe)
* การจัดการ Validation และ Error Handling
* การจัดทำเอกสารระบบ (Documentation)

---

## 👥 Team Structure

* ทำงานเป็นกลุ่ม กลุ่มละ **3–4 คน**
* ระยะเวลาการพัฒนา **ประมาณ 2 สัปดาห์**
* สมาชิกทุกคนต้องมี commit ใน repository
* รายชื่อสมาชิกต้องถูกระบุไว้ใน `package.json` (key `contributors`)

---

## 🛠 Technology Stack

* **Framework:** NestJS
* **Language:** TypeScript
* **API Style:** REST API
* **Database:** JSON-based (file-based หรือ in-memory)
* **API Documentation:** Swagger (OpenAPI)
* **Linting:** ESLint (TypeScript ESLint)

---

## 📁 Project Structure

```text
.
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   │
│   ├── modules/
│   │   └── example/
│   │       └── dto/
│   │
│   └── common/
│       ├── interfaces/
│       └── utils/
│
├── docs/
│   ├── api-specification.md
│   ├── data-model.md
│   └── uml-diagram.png
├── subjects/
│   ├── requirement.md
│   ├── submission.md
│   ├── evaluation.md
│   └── models.md
│
├── package.json
├── tsconfig.json
└── README.md
```

> 📌 หมายเหตุ: 
> * โครงสร้างอาจมีการปรับเพิ่มเติมได้ตามความเหมาะสม แต่ต้องยังคงความเป็นระเบียบและอ่านง่าย
> * **แนะนำให้แยก module ตาม models** (เช่น `modules/users/`, `modules/products/`) เพื่อให้โค้ดเป็นระบบและดูแลรักษาง่าย
> * แต่ละ module ควรมี controller, service, และ dto ของตัวเอง

---

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run start:dev
```

### 3. API Documentation (Swagger)

เมื่อรันโปรเจคแล้ว สามารถเข้าดู Swagger ได้ที่:

```text
http://localhost:3000/api
```

### 4. Frontend Dashboard

มี frontend dashboard แบบ static เพิ่มในโฟลเดอร์ `frontend/` สำหรับใช้งานกับ API ที่รันบน `http://localhost:3000`

เปิดไฟล์นี้ด้วย browser ได้ทันที:

```text
frontend/index.html
```

ฟีเจอร์หลักที่รองรับ:

* ซื้อสินค้าโดยเลือกลูกค้า (สร้าง order)
* ดูประวัติว่าลูกค้าคนไหนซื้ออะไรบ้าง
* CRUD สินค้า
* แก้สถานะ order และ tracking number
* ดู insights เช่น top buyers และ top products

### 5. New Customer APIs

เพิ่ม REST APIs สำหรับ `customer` และความสัมพันธ์ข้าม model:

* `GET /customer`
* `GET /customer/:id`
* `POST /customer`
* `PUT /customer/:id`
* `PATCH /customer/:id`
* `DELETE /customer/:id`
* `GET /customer/:id/orders`
* `GET /customer/insights/top-buyers`
* `GET /products/:id/customers`
* `GET /products/insights/most-bought`

---

## 🧩 Model Sets

แต่ละกลุ่มต้องเลือก **Model Set 1 ชุด** จาก 10 ชุดที่มีให้

**วิธีการเลือก Model Set:**
1. นำ Student ID ของสมาชิกทุกคนในกลุ่มมารวมกัน (`sumStudentId`)
2. นำผลรวม mod 10
3. ค่าที่ได้ (0-9) จะเป็น Model Set ID ที่กลุ่มได้รับ

**ตัวอย่าง:** 
- สมาชิก 3 คน มี Student ID: 64123456, 64123457, 64123458
- `sumStudentId` = 64123456 + 64123457 + 64123458 = 192370371
- 192370371 mod 10 = 1 → **Model Set ID: "1"** (Blog / Content Platform)

> 📌 **เมื่อได้ Model Set แล้ว ห้ามเปลี่ยน** เว้นแต่ได้รับอนุญาตจากอาจารย์

**หลังจากเลือก Model Set แล้ว ให้บันทึกใน `package.json`:**
```json
{
  "project": {
    "model": {
      "id": "1",
      "name": "Blog / Content Platform"
    },
    "sumStudentId": 192370371
  }
}
```

**รายละเอียด Model Sets ทั้งหมด:** → [`subjects/models.md`](subjects/models.md)

---

## 📐 Project Requirements (Summary)

### Data Model
* ต้องเลือกใช้ **Model Set 1 ชุด** จาก 10 ชุดที่มีให้ (ดูรายละเอียดใน [`subjects/models.md`](subjects/models.md))
* แต่ละ Model Set มี **Core Data Model 2 Models**
* ต้องบันทึก Model Set ที่เลือกไว้ใน `package.json` (key `project`)
* ใช้ TypeScript data type ให้ครบถ้วน
* ต้องมีการใช้งาน **Enum อย่างน้อย 1 จุด**
* ❌ **ห้ามใช้ `any` type ในทุกกรณี**

### API Design
* ทุก Model ต้องรองรับ **CRUD Operation ครบถ้วน**
* ใช้ HTTP Method ให้ถูกต้องตามหลัก REST API:
  * `GET /resources` - ดึงข้อมูลทั้งหมด
  * `GET /resources/{id}` - ดึงข้อมูลตาม ID
  * `POST /resources` - สร้างข้อมูลใหม่
  * `PUT /resources/{id}` - อัปเดตข้อมูลทั้งหมด
  * `PATCH /resources/{id}` - อัปเดตข้อมูลบางส่วน
  * `DELETE /resources/{id}` - ลบข้อมูล
* URL path ต้องตั้งชื่อให้สื่อความหมาย

### Standard Response Format

ทุก API ต้องใช้ Response Format แบบเดียวกัน:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | null;
}
```

### Validation & Error Handling
* ทุก API ต้องมีการ **validate ข้อมูล**
* ใช้ **HTTP Status Code** ที่เหมาะสม:
  * `200` - OK (GET, PUT, PATCH สำเร็จ)
  * `201` - Created (POST สำเร็จ)
  * `400` - Bad Request (Validation error)
  * `403` - Forbidden (ไม่มีสิทธิ์)
  * `404` - Not Found (ไม่พบข้อมูล)
  * `500` - Internal Server Error (Server error)
* ⚠️ **ไม่ควรเกิด Error 500 จาก logic ที่สามารถป้องกันได้**
* หากพบ Error 500 มากกว่า 5 จุด อาจมีผลต่อการให้คะแนน

---

## 📄 Documentation

เอกสารรายละเอียดของโจทย์และข้อกำหนดทั้งหมดถูกจัดเก็บไว้ในโฟลเดอร์ `subjects/`

### เอกสารโจทย์ (Project Specification)

* 📘 **Project Requirement** — ขอบเขตและข้อกำหนดของโปรเจค
  → [`subjects/requirement.md`](subjects/requirement.md)
* 🧩 **Model Sets** — รายละเอียด Model Sets ทั้ง 10 ชุด
  → [`subjects/models.md`](subjects/models.md)
* 📦 **Submission Guideline** — รูปแบบและขั้นตอนการส่งงาน
  → [`subjects/submission.md`](subjects/submission.md)
* 🧮 **Evaluation Criteria** — เกณฑ์การให้คะแนนและการประเมินผล
  → [`subjects/evaluation.md`](subjects/evaluation.md)

### เอกสารทางเทคนิค (ต้องจัดทำ)

* 🔌 **API Specification (Swagger)** — เอกสาร API ทุก Endpoint
* 🧱 **Data Model Documentation** — เอกสารอธิบาย Data Model
* 📊 **UML Diagram** — แผนภาพ UML ของ Data Model
* 🧭 **UML Documentation** — ดู Mermaid diagrams ฉบับเต็มได้ที่ `docs/uml-diagrams.md`

---

## 👥 Team & Contributors

รายชื่อสมาชิกในกลุ่มต้องถูกระบุไว้ใน key `contributors` ภายในไฟล์ `package.json` โดยมีรูปแบบดังนี้:

```json
"contributors": [
  {
    "fullname": "ชื่อ-นามสกุล",
    "username": "github-username",
    "studentId": "รหัสนักศึกษา"
  }
]
```

---

## 🤖 AI Usage Policy

* อนุญาตให้ใช้ AI (เช่น ChatGPT) ช่วยในการพัฒนาโปรเจค
* นักศึกษาต้องสามารถอธิบายโค้ดและแนวคิดของระบบได้ด้วยตนเอง
* หากไม่สามารถอธิบายได้ อาจมีผลต่อการประเมินคะแนน

---

## ✅ Submission

* ส่งงานเป็น **GitHub Repository URL** ในนามของ **Team Lead**
* Repository ต้องสามารถเข้าถึงได้

---

## 📝 Important Notes

* โค้ดต้องอ่านง่าย เป็นระบบ และดูแลรักษาได้
* ทุก request และ response ต้องกำหนด interface แบบ narrow type
* ใช้ TypeScript strict mode (`strict: true` ใน tsconfig.json)
* ESLint จะตรวจสอบและป้องกันการใช้ `any` type อัตโนมัติ

---

📌 *This repository is intended for educational purposes only.*
