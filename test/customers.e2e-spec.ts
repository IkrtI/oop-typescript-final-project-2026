import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import {
  expectApiSuccess,
  expectErrorResponse,
  resetDataFiles,
  validProductPayload,
  validOrderPayload,
  CustomerResponse,
  CustomerOrderHistoryResponse,
} from './utils/e2e-helpers';

describe('Customers API (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    resetDataFiles();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /customer should return seeded customers', async () => {
    const { body } = await request(app.getHttpServer()).get('/customers').expect(200);
    const data = expectApiSuccess<CustomerResponse[]>(body);
    expect(data.length).toBeGreaterThanOrEqual(2);
  });

  it('POST /customer should create customer', async () => {
    const { body } = await request(app.getHttpServer())
      .post('/customers')
      .send({
        fullName: 'Jane Test',
        email: 'jane@test.com',
        phone: '0899999999',
        address: 'Bangkok, Thailand',
      })
      .expect(201);

    const data = expectApiSuccess<CustomerResponse>(body);
    expect(data.fullName).toBe('Jane Test');
    expect(data.status).toBe('ACTIVE');
  });

  it('DELETE /customer/:id should fail if customer has order history', async () => {
    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .send(validProductPayload())
      .expect(201);

    await request(app.getHttpServer())
      .post('/orders')
      .send(validOrderPayload(productResponse.body.data.id, 1))
      .expect(201);

    const { body } = await request(app.getHttpServer())
      .delete('/customers/CUST-E2E-001')
      .expect(400);

    expectErrorResponse(body, 400);
  });

  it('GET /customer/:id/orders should return customer purchase history', async () => {
    const { body } = await request(app.getHttpServer())
      .get('/customers/CUST-E2E-001/orders')
      .expect(200);

    const data = expectApiSuccess<CustomerOrderHistoryResponse>(body);
    expect(data.customer.id).toBe('CUST-E2E-001');
    expect(data.summary.totalOrders).toBeGreaterThan(0);
  });

  it('GET /products/:id/customers should show who bought product', async () => {
    const productResponse = await request(app.getHttpServer())
      .post('/products')
      .send(validProductPayload({ sku: `SKU-${Date.now()}` }))
      .expect(201);

    await request(app.getHttpServer())
      .post('/orders')
      .send(validOrderPayload(productResponse.body.data.id, 2))
      .expect(201);

    const { body } = await request(app.getHttpServer())
      .get(`/products/${productResponse.body.data.id}/customers`)
      .expect(200);

    const data = expectApiSuccess<Array<{ customerId: string }>>(body);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0].customerId).toBeDefined();
  });
});
