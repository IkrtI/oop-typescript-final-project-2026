# NestJS Backend API — Project Template

## 📌 Project Overview

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

### 4.1 Open Dashboard Through Nest Route

เมื่อรัน backend แล้วสามารถเข้า dashboard ผ่าน route นี้ได้ด้วย:

```text
http://localhost:3000/app
```

### 4.2 Deploy to Vercel (Serverless)

โปรเจคนี้เตรียม `vercel.json` และ `serverless.ts` แล้วเพื่อ deploy แบบ Serverless บน Vercel:

1. ติดตั้ง Vercel CLI (ถ้ายังไม่มี)

```bash
npm i -g vercel
```

2. Deploy จาก root ของโปรเจค

```bash
vercel
```

3. Production deploy

```bash
vercel --prod
```

พฤติกรรมหลัง deploy:

* `/app` และ `/app/*` ถูกเสิร์ฟเป็น static frontend (เร็วกว่าเสิร์ฟผ่าน function)
* เส้น API ทั้งหมดถูกส่งเข้า NestJS Serverless handler

ข้อควรทราบสำคัญสำหรับ Vercel Serverless:

* ระบบไฟล์ของ deployment เป็น read-only
* ข้อมูลที่แก้ไขผ่าน CRUD จะคงอยู่เฉพาะ in-memory ของ instance ที่ยัง warm อยู่ (ไม่ถาวร)
* หากต้องการ persistence จริง ควรย้าย repository จาก JSON file ไปใช้ Database (เช่น Neon/PostgreSQL, Supabase, MongoDB Atlas)

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
