Architecture Design Specification: มาตรฐานการออกแบบ Data Access Layer ด้วย Repository Pattern ใน NestJS

ในฐานะ Senior Software Architect มาตรฐานฉบับนี้ถูกกำหนดขึ้นเพื่อวางรากฐานทางสถาปัตยกรรมสำหรับแอปพลิเคชัน NestJS โดยมุ่งเน้นที่การแยก Business Logic ออกจากกลไกการจัดเก็บข้อมูล (Data Access Layer) อย่างเด็ดขาด ความล้มเหลวในการแยกส่วนประกอบ (Decoupling) จะนำไปสู่หนี้ทางเทคนิค (Technical Debt) ที่ทำให้ระบบยากต่อการทดสอบและบำรุงรักษาในระยะยาว


--------------------------------------------------------------------------------


1. พื้นฐานสถาปัตยกรรมและการแยกส่วนประกอบ (Architectural Foundation & Decoupling)

สถาปัตยกรรมที่ยั่งยืนเริ่มต้นจากความชัดเจนของหน้าที่ (Separation of Concerns) ในโปรเจกต์ระดับองค์กร เราจำเป็นต้องใช้ Repository Pattern เพื่อทำหน้าที่เป็น Abstraction Layer ระหว่างตรรกะทางธุรกิจและแหล่งข้อมูล (Data Source) ไม่ว่าจะเป็นฐานข้อมูล SQL หรือระบบไฟล์ JSON

นิยามและบทบาทของ Repository Pattern

Repository Pattern คือตัวกลางที่รวมศูนย์การเข้าถึงข้อมูล โดยซ่อนรายละเอียดเชิงเทคนิคของการสืบค้น (Queries) และการจัดเก็บ (Persistence) ไว้เบื้องหลัง Interface ที่เรียบง่าย ทำให้ Business Service สามารถทำงานกับ "Domain Objects" ได้โดยไม่ต้องกังวลว่าข้อมูลถูกจัดเก็บอย่างไร

วิเคราะห์ข้อดีและข้อเสีย (Pros & Cons)

* ข้อดี (Pros):
  * Abstraction: สามารถเปลี่ยนระบบจัดเก็บข้อมูลได้โดยไม่กระทบต่อ Service Layer
  * Testability: ช่วยให้การเขียน Unit Test ทำได้ง่ายผ่านการ Mock Repository Interface
  * Centralization: ลดความซ้ำซ้อนของโค้ดสืบค้นข้อมูลตามหลักการ DRY (Don't Repeat Yourself)
* ข้อเสีย (Cons):
  * Increased Complexity: เพิ่มจำนวนไฟล์และลำดับชั้นของโค้ดในช่วงเริ่มต้น
  * Abstraction Leakage: รายละเอียดของ Data Source เช่น Pagination หรือ Lazy Loading อาจรั่วไหลออกมาหากออกแบบ Interface ไม่รัดกุม

สถาปัตยกรรมที่แข็งแกร่งต้องเริ่มต้นจากการกำหนดโครงสร้างข้อมูลพื้นฐานที่สอดคล้องกันทั่วทั้งระบบ ซึ่งจะถูกนิยามผ่าน Base Entity


--------------------------------------------------------------------------------


2. มาตรฐานการออกแบบ Entity และโครงสร้างข้อมูลหลัก (Data Modeling & Base Entity Standards)

แนวคิด "Single Source of Truth" คือหัวใจของการออกแบบ Entity เราจะใช้ Abstract Class เพื่อกำหนดมาตรฐานข้อมูลที่ทุก Model ต้องมีร่วมกัน เพื่อให้อินเทอร์เฟซของข้อมูลมีความเสถียรและรองรับการทำ Audit ในอนาคต

การสร้าง Base Entity มาตรฐาน

Entity ทุกตัวในระบบต้องสืบทอดมาจาก BaseEntity ซึ่งประกอบด้วยฟิลด์บังคับ id, createdAt และ updatedAt เพื่อความเป็นระเบียบและง่ายต่อการขยายระบบไปใช้ TypeORM หรือฐานข้อมูล SQL ในภายหลัง

import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * BaseEntity สำหรับกำหนดฟิลด์พื้นฐานที่ทุก Model ต้องมี
 * ปฏิบัติตามมาตรฐาน Identity และ Audit Fields
 */
export abstract class BaseEntity {
  @PrimaryGeneratedColumn('identity')
  id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updatedAt?: Date;
}


ข้อบังคับในการใช้ Enum สำหรับความปลอดภัยของข้อมูล (Type-safety)

ตามข้อกำหนดของโปรเจกต์ (Project Requirement) ต้องมีการใช้ Enum อย่างน้อย 1 จุด เพื่อควบคุมสถานะหรือประเภทข้อมูลให้เป็นไปตามที่กำหนด (Strict Typing) เช่น:

export enum OrderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}


การมี Entity ที่แข็งแกร่งเป็นรากฐานสำคัญในการส่งผ่านข้อมูลผ่าน DTO ซึ่งจะทำหน้าที่เป็นสัญญาการรับส่งข้อมูลในส่วนถัดไป


--------------------------------------------------------------------------------


3. การจัดการสัญญาข้อมูลด้วย Data Transfer Objects (DTOs) และการ Validation

DTO (Data Transfer Object) คือ "Network Contract" ระหว่าง Client และ Server การทำ Input Validation ทันทีที่ข้อมูลเข้าสู่ระบบเป็นปราการด่านแรกในการป้องกันข้อมูลที่ผิดพลาดและภัยคุกคามทางไซเบอร์

ความปลอดภัยด้วยการแยก Input และ Output DTO

เพื่อความปลอดภัยสูงสุด (Security-by-Design) เราต้องแยก DTO สำหรับรับข้อมูลและส่งข้อมูลออกจากกัน:

* Input DTO: ใช้สำหรับตรวจสอบความถูกต้องของข้อมูลขาเข้า
* Output DTO: ใช้ควบคุมข้อมูลที่จะส่งกลับไปยัง Client การใช้ @Exclude() จาก class-transformer จะป้องกันข้อมูลอ่อนไหว (เช่น Password) รั่วไหล
* Architectural Prescription: ในชั้น Service ต้องใช้ plainToInstance พร้อมตัวเลือก { excludeExtraneousValues: true } เพื่อให้ @Exclude() ทำงานได้อย่างสมบูรณ์

มาตรฐาน Decorators สำหรับการ Validation

การใช้ class-validator ต้องครอบคลุมทุกความเสี่ยงของข้อมูล ดังตารางด้านล่าง:

Decorator	หน้าที่และการตรวจสอบ
@IsString()	ตรวจสอบประเภทข้อมูลที่เป็นข้อความ
@IsEmail()	ตรวจสอบรูปแบบอีเมลให้ถูกต้องตามมาตรฐาน
@IsEnum(Type)	บังคับให้ข้อมูลตรงกับค่าที่กำหนดใน Enum เท่านั้น
@IsOptional()	อนุญาตให้ฟิลด์เป็นค่าว่างได้ (มักใช้ใน Patch DTO)
@MinLength(n)	ตรวจสอบความยาวขั้นต่ำของข้อมูลข้อความ

การตั้งค่า Global Validation ใน main.ts

ตั้งค่า ValidationPipe เพื่อให้ระบบตรวจสอบข้อมูลโดยอัตโนมัติ (Global Enforcement):

app.useGlobalPipes(new ValidationPipe({
  whitelist: true, // ตัดฟิลด์ที่ไม่อยู่ใน DTO ทิ้ง
  forbidNonWhitelisted: true, // ปฏิเสธ Request หากมีฟิลด์ที่ไม่ได้รับอนุญาต
  transform: true, // แปลงข้อมูลเป็น Class Instance โดยอัตโนมัติ
}));


เมื่อสัญญาข้อมูลถูกกำหนดชัดเจน ชั้นถัดไปคือการจัดการข้อมูลเหล่านั้นผ่าน Repository Layer ที่รองรับการเก็บรักษาข้อมูล (Persistence)


--------------------------------------------------------------------------------


4. การปรับใช้ Repository Layer และกลยุทธ์การเก็บข้อมูลแบบ JSON-based

การออกแบบ BaseRepository แบบ Generic ช่วยลดความซ้ำซ้อนตามหลักการ DRY ในบริบทของโปรเจกต์นี้ เราจะใช้ JSON-based storage เพื่อความเรียบง่าย แต่ต้องรักษาความแข็งแกร่งของระบบผ่านการจัดการไฟล์แบบ Asynchronous และ Atomic

โครงสร้าง BaseRepository และ Persistence Logic

เราจะใช้ fs/promises ร่วมกับ crypto เพื่อสร้างกระบวนการเขียนไฟล์ที่ปลอดภัยที่สุด

import { writeFile, rename, unlink, readFile } from 'fs/promises';
import { randomBytes } from 'crypto';

export abstract class BaseRepository<T extends { id: string }> {
  /**
   * กลยุทธ์ Atomic Write เพื่อป้องกันข้อมูลเสียหาย (Data Corruption)
   * เขียนลงไฟล์ชั่วคราวก่อนแล้วจึง Rename ทับไฟล์จริง
   */
  protected async atomicWrite(filepath: string, data: T[]): Promise<void> {
    const tempPath = `${filepath}.${randomBytes(6).toString('hex')}.tmp`;
    try {
      const jsonData = JSON.stringify(data, null, 2); // Human-readable format
      await writeFile(tempPath, jsonData, 'utf8');
      await rename(tempPath, filepath);
    } catch (error) {
      try { await unlink(tempPath); } catch {} // Cleanup
      throw new Error(`Failed to persist data: ${error.message}`);
    }
  }

  abstract findAll(page: number, limit: number): Promise<IPaginatedHttpResponse<T>>;
  abstract create(data: Partial<T>): Promise<T>;
}


การจัดการข้อมูลที่ชั้น Repository นี้จะถูกนำเสนอผ่าน API Interface ที่มีเอกสารกำกับอย่างชัดเจนในส่วนถัดไป


--------------------------------------------------------------------------------


5. การออกแบบ Interface และการจัดทำเอกสารระบบ (API Interface & Swagger Documentation)

เอกสาร API (OpenAPI/Swagger) ที่ดีช่วยลดช่องว่างในการสื่อสารระหว่างนักพัฒนา และต้องรักษาความสะอาดของ Controller ด้วยเทคนิคการแยกไฟล์

การแยก Documentation เพื่อความสะอาดของโค้ด (Clean Controller)

เราจะใช้ applyDecorators เพื่อแยก Swagger Metadata ออกไปไว้ในไฟล์ .doc.ts ตามหลักการ Single Responsibility

// pet.controller.doc.ts
import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function CreatePetDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'สร้างข้อมูลสัตว์เลี้ยงใหม่' }),
    ApiResponse({ status: 201, description: 'สร้างสำเร็จ', type: PetDto }),
    ApiResponse({ status: 400, description: 'ข้อมูลไม่ถูกต้อง' }),
  );
}


มาตรฐานการตอบกลับและ Pagination (Standard Response Format)

ทุก API ต้องมีการตอบกลับในรูปแบบเดียวกัน โดยเฉพาะการดึงข้อมูลแบบชุด (List) ที่ต้องมี Pagination Metadata ตามมาตรฐานสากล:

Structure:

export interface IPaginatedHttpResponse<T> {
  data: T[];
  meta: {
    total: number; // จำนวนข้อมูลทั้งหมด
    page: number;  // หน้าปัจจุบัน
    limit: number; // จำนวนข้อมูลต่อหน้า
  };
}



--------------------------------------------------------------------------------


6. แนวทางปฏิบัติที่เป็นเลิศและเกณฑ์การควบคุมคุณภาพ (Best Practices & Quality Control)

ในฐานะสถาปนิก ความปลอดภัยและความถูกต้องของ Type เป็นเรื่องที่ ต่อรองไม่ได้ (Non-negotiable) การตั้งค่า strict: true ใน tsconfig.json และการหลีกเลี่ยง any คือหัวใจสำคัญ

รายการตรวจสอบคุณภาพ (Architectural Quality Checklist)

* [ ] Strict Typing: ห้ามใช้ any ในทุกกรณี และต้องกำหนด Narrow Type สำหรับทุก Request/Response
* [ ] RESTful Standards: ใช้ HTTP Method ให้ถูกต้อง (GET, POST, PUT, PATCH, DELETE)
* [ ] Status Code Compliance:
  * 200/201 สำหรับ Success
  * 400 สำหรับ Validation Error
  * 403 สำหรับ Forbidden Access (สิทธิ์ไม่ถึง)
  * 404 สำหรับ Resource Not Found
* [ ] Zero Unhandled Errors: ระบบต้องไม่มีการเกิด Error 500 จาก Logic ที่ป้องกันได้ (หากพบมากกว่า 5 จุด จะถือว่าไม่ผ่านเกณฑ์คุณภาพ)
* [ ] Documentation: มี Swagger ครบทุก Endpoint และมี UML Diagram แสดงความสัมพันธ์ของ Core Models

การสร้างซอฟต์แวร์ที่ยอดเยี่ยมไม่ใช่แค่การเขียนให้โค้ดทำงานได้ แต่คือการสร้างโครงสร้างที่ผู้อื่นสามารถทำงานต่อได้อย่างมั่นใจและยั่งยืน มาตรฐานเหล่านี้คือพันธสัญญาแห่งคุณภาพที่เราต้องยึดถือร่วมกัน
