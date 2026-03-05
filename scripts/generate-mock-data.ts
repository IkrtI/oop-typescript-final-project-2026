import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const now = new Date();
const iso = (d) => d.toISOString();

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d;
}

function addHours(base, hours) {
  const d = new Date(base);
  d.setHours(d.getHours() + hours);
  return d;
}

const customerSeeds = [
  ["Somchai Applefan", "somchai.applefan@example.com"],
  ["Arisa Tech", "arisa.tech@example.com"],
  ["Narin Pro", "narin.pro@example.com"],
  ["Kanya Device", "kanya.device@example.com"],
  ["Preecha Studio", "preecha.studio@example.com"],
  ["Mali Creator", "mali.creator@example.com"],
  ["Thanawat Office", "thanawat.office@example.com"],
  ["Suda Mobile", "suda.mobile@example.com"],
  ["Anan Premium", "anan.premium@example.com"],
  ["Nicha Education", "nicha.education@example.com"],
  ["Phuri Developer", "phuri.dev@example.com"],
  ["Dao Business", "dao.business@example.com"],
];

const productSeeds = [
  ["iPhone 15", 28900, 42],
  ["iPhone 15 Plus", 32900, 35],
  ["iPhone 15 Pro", 41900, 28],
  ["iPhone 15 Pro Max", 48900, 25],
  ["iPhone 14", 24900, 31],
  ["iPhone 14 Plus", 28900, 22],
  ["iPhone SE (3rd Gen)", 15900, 17],
  ["iPad 10th Gen", 13900, 27],
  ["iPad Air M2", 23900, 20],
  ["iPad Pro 11 M4", 39900, 16],
  ["iPad Pro 13 M4", 47900, 12],
  ["iPad mini", 19900, 18],
  ["MacBook Air 13 M3", 38900, 14],
  ["MacBook Air 15 M3", 45900, 10],
  ["MacBook Pro 14 M3", 62900, 9],
  ["MacBook Pro 16 M3 Max", 119900, 6],
  ["iMac 24 M3", 49900, 11],
  ["Mac mini M2", 20900, 13],
  ["Mac Studio M2 Max", 74900, 5],
  ["Mac Pro M2 Ultra", 229900, 2],
  ["Apple Watch SE", 9490, 30],
  ["Apple Watch Series 9", 15900, 26],
  ["Apple Watch Ultra 2", 31900, 8],
  ["AirPods 2", 4990, 40],
  ["AirPods 3", 6790, 34],
  ["AirPods Pro 2", 8990, 37],
  ["AirPods Max", 19900, 7],
  ["HomePod mini", 3990, 33],
  ["Apple TV 4K", 5990, 21],
  ["Magic Keyboard", 3790, 24],
  ["Magic Mouse", 2690, 29],
  ["Studio Display", 54900, 4],
];

const customers = customerSeeds.map((seed, index) => {
  const createdAt = addDays(now, -(120 - index * 3));
  return {
    id: `CUST-APL-${String(index + 1).padStart(3, "0")}`,
    fullName: seed[0],
    email: seed[1],
    phone: `08${String(10000000 + index * 13791).slice(0, 8)}`,
    address: `${10 + index} Apple Avenue, Bangkok 10${String(100 + index).slice(-3)}`,
    status: index === 10 ? "INACTIVE" : "ACTIVE",
    createdAt: iso(createdAt),
    updatedAt: iso(addDays(createdAt, 2)),
  };
});

const products = productSeeds.map((seed, index) => {
  const createdAt = addDays(now, -(80 - index));
  const stockQuantity = seed[2] as number;
  return {
    id: randomUUID(),
    name: seed[0],
    description: `${seed[0]} original Apple device with official Thailand warranty`,
    price: seed[1],
    stockQuantity,
    sku: `APPLE-${String(index + 1).padStart(3, "0")}`,
    category: "ELECTRONICS",
    brand: "Apple",
    images: [`https://example.com/apple/${String(index + 1).padStart(3, "0")}.jpg`],
    weight: null,
    status: stockQuantity <= 5 ? "OUT_OF_STOCK" : "ACTIVE",
    createdAt: iso(createdAt),
    updatedAt: iso(addDays(createdAt, 1)),
  };
});

const paymentMethods = ["CREDIT_CARD", "BANK_TRANSFER", "COD"];
const orderStatuses = ["PENDING", "PAID", "SHIPPED", "COMPLETED"];
const orders: unknown[] = [];

for (let i = 0; i < 24; i += 1) {
  const customer = customers[i % customers.length];
  const firstProduct = products[i % products.length];
  const secondProduct = products[(i * 3 + 5) % products.length];

  const firstQty = (i % 3) + 1;
  const secondQty = ((i + 1) % 2) + 1;

  const items = [
    {
      productId: firstProduct.id,
      productName: firstProduct.name,
      priceAtPurchase: firstProduct.price as number,
      quantity: firstQty,
      subtotal: (firstProduct.price as number) * firstQty,
    },
  ];

  if (i % 2 === 0) {
    items.push({
      productId: secondProduct.id,
      productName: secondProduct.name,
      priceAtPurchase: secondProduct.price as number,
      quantity: secondQty,
      subtotal: (secondProduct.price as number) * secondQty,
    });
  }

  const placedAt = addHours(addDays(now, -(25 - i)), i % 7);
  const status = orderStatuses[i % orderStatuses.length];

  orders.push({
    id: randomUUID(),
    customerId: customer.id,
    items,
    totalAmount: items.reduce((sum, item) => sum + item.subtotal, 0),
    status,
    paymentMethod: paymentMethods[i % paymentMethods.length],
    shippingAddress: customer.address,
    trackingNumber:
      status === "SHIPPED" || status === "COMPLETED"
        ? `TH${String(100000000 + i)}`
        : null,
    note: i % 5 === 0 ? "Priority customer" : null,
    placedAt: iso(placedAt),
    createdAt: iso(placedAt),
    updatedAt: iso(addHours(placedAt, 6)),
  });
}

const dataDir = path.join(process.cwd(), "data");
fs.writeFileSync(path.join(dataDir, "customers.json"), JSON.stringify(customers, null, 2));
fs.writeFileSync(path.join(dataDir, "products.json"), JSON.stringify(products, null, 2));
fs.writeFileSync(path.join(dataDir, "orders.json"), JSON.stringify(orders, null, 2));

console.log(`Generated customers=${customers.length}, products=${products.length}, orders=${orders.length}`);
