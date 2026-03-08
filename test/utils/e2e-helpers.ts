import { expect } from "@jest/globals";

import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';

/* ------------------------------------------------------------------ */
/*  Paths                                                              */
/* ------------------------------------------------------------------ */
const DATA_DIR = join(process.cwd(), 'test', 'data');
export const PRODUCTS_FILE = join(DATA_DIR, 'products.json');
export const ORDERS_FILE = join(DATA_DIR, 'orders.json');
export const CUSTOMERS_FILE = join(DATA_DIR, 'customers.json');

/* ------------------------------------------------------------------ */
/*  Data reset                                                         */
/* ------------------------------------------------------------------ */

/** Overwrite both JSON data files with empty arrays. */
export function resetDataFiles(): void {
  process.env.DATA_DIR = DATA_DIR;
  mkdirSync(DATA_DIR, { recursive: true });

  writeFileSync(PRODUCTS_FILE, '[]', 'utf-8');
  writeFileSync(ORDERS_FILE, '[]', 'utf-8');
  writeFileSync(
    CUSTOMERS_FILE,
    JSON.stringify(
      [
        {
          id: 'CUST-E2E-001',
          fullName: 'Demo Customer',
          email: 'cust-e2e-001@example.com',
          phone: '0800000001',
          address: '123 Test Street, Test City 10000',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'CUST-MULTI',
          fullName: 'Multi Buyer',
          email: 'cust-multi@example.com',
          phone: '0800000002',
          address: '456 Multi Street',
          status: 'ACTIVE',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      null,
      2,
    ),
    'utf-8',
  );
}

/* ------------------------------------------------------------------ */
/*  Unique identifier factories                                        */
/* ------------------------------------------------------------------ */

let skuCounter = 0;
/** Return a unique SKU string per test run. */
export function uniqueSku(prefix = 'TEST'): string {
  return `${prefix}-${Date.now()}-${++skuCounter}`;
}

/* ------------------------------------------------------------------ */
/*  Payload factories                                                  */
/* ------------------------------------------------------------------ */

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  category: string;
  brand: string;
  images: string[];
  weight?: number;
  status?: string;
}

export function validProductPayload(
  overrides: Partial<CreateProductPayload> = {},
): CreateProductPayload {
  return {
    name: 'Test Product',
    description: 'A product created by E2E tests',
    price: 199.99,
    stockQuantity: 50,
    sku: uniqueSku(),
    category: 'ELECTRONICS',
    brand: 'TestBrand',
    images: ['https://example.com/img.jpg'],
    ...overrides,
  };
}

export interface CreateOrderPayload {
  customerId: string;
  items: { productId: string; quantity: number }[];
  paymentMethod: string;
  shippingAddress: string;
  note?: string;
}

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  sku: string;
  category: string;
  brand: string;
  images: string[];
  weight: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerResponse {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerOrderHistoryResponse {
  customer: CustomerResponse;
  orders: unknown[];
  summary: {
    totalOrders: number;
    totalSpent: number;
    distinctProducts: number;
    lastOrderAt: string | null;
    products: Array<{
      productId: string;
      productName: string;
      totalQuantity: number;
      totalSpent: number;
    }>;
  };
}

export interface OrderItemResponse {
  productId: string;
  productName: string;
  priceAtPurchase: number;
  quantity: number;
  subtotal: number;
}

export interface OrderResponse {
  id: string;
  customerId: string;
  items: OrderItemResponse[];
  totalAmount: number;
  status: string;
  paymentMethod: string;
  shippingAddress: string;
  trackingNumber: string | null;
  note: string | null;
  placedAt: string;
  createdAt: string;
  updatedAt: string;
}

export function validOrderPayload(
  productId: string,
  quantity = 1,
  overrides: Partial<CreateOrderPayload> = {},
): CreateOrderPayload {
  return {
    customerId: 'CUST-E2E-001',
    items: [{ productId, quantity }],
    paymentMethod: 'CREDIT_CARD',
    shippingAddress: '123 Test Street, Test City 10000',
    ...overrides,
  };
}

/* ------------------------------------------------------------------ */
/*  Assertion helpers                                                  */
/* ------------------------------------------------------------------ */

/**
 * Assert the standard success ApiResponse shape.
 * Returns the `data` property for further assertions.
 */
export function expectApiSuccess<T = unknown>(body: unknown): T {
  expect(body).toHaveProperty('success', true);
  expect(body).toHaveProperty('message');
  expect(typeof (body as { message: unknown }).message).toBe('string');
  expect(body).toHaveProperty('data');
  return (body as { data: T }).data;
}

/**
 * Assert the standard NestJS error response shape.
 */
export function expectErrorResponse(
  body: unknown,
  expectedStatus: number,
): void {
  expect(body).toHaveProperty('statusCode', expectedStatus);
  expect(body).toHaveProperty('message');
}