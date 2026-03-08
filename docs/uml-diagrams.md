# UML Documentation — E-commerce Basic (Model Set 5)

เอกสารนี้รวบรวม UML ของระบบทั้งหมด โดยอ้างอิงจาก implementation จริงในโค้ด NestJS ปัจจุบัน ไม่ใช่เพียง data model ตามโจทย์เท่านั้น

## Scope

- Backend: NestJS + Swagger + ValidationPipe
- Data source: JSON files (`data/products.json`, `data/orders.json`, `data/customers.json`)
- Domains: Products, Orders, Customers
- Shared components: `AppModule`, `JsonFileRepository<T>`, `BaseEntity`, `ApiResponse<T>`
- Frontend: static dashboard ที่ถูก serve ผ่าน `/app`

---

## 1. System Architecture Diagram

```mermaid
flowchart LR
    User[User / Browser] --> Frontend[Static Frontend /app]
    User --> Swagger[Swagger UI /api]
    User --> Api[REST API]

    subgraph NestJS Application
        Main[main.ts\nBootstrap + Validation + Swagger + Static Assets]
        AppModule[AppModule]

        subgraph Controllers
            ProductsController
            OrdersController
            CustomersController
        end

        subgraph Services
            ProductsService
            OrdersService
            CustomersService
        end

        subgraph Repositories
            ProductsRepository
            OrdersRepository
            CustomersRepository
            JsonFileRepository[JsonFileRepository Generic]
        end
    end

    Api --> Main --> AppModule
    AppModule --> ProductsController
    AppModule --> OrdersController
    AppModule --> CustomersController

    ProductsController --> ProductsService
    OrdersController --> OrdersService
    CustomersController --> CustomersService

    ProductsService --> ProductsRepository
    ProductsService --> OrdersRepository
    ProductsService --> CustomersRepository

    OrdersService --> OrdersRepository
    OrdersService --> ProductsService
    OrdersService --> CustomersService

    CustomersService --> CustomersRepository
    CustomersService --> OrdersRepository

    ProductsRepository --> JsonFileRepository
    OrdersRepository --> JsonFileRepository
    CustomersRepository --> JsonFileRepository

    JsonFileRepository --> ProductsJson[(products.json)]
    JsonFileRepository --> OrdersJson[(orders.json)]
    JsonFileRepository --> CustomersJson[(customers.json)]
```

---

## 2. Use Case Diagram

```mermaid
flowchart TB
    Client[Client / Frontend / API Consumer]

    subgraph E-commerce Basic API
        UC1[Manage Products\nCRUD Products]
        UC2[Manage Orders\nCreate / View / Patch / Delete]
        UC3[Manage Customers\nCRUD Customers]
        UC4[View Customer Order History]
        UC5[View Top Buyers]
        UC6[View Product Buyers]
        UC7[View Most Bought Products]
        UC8[Automatic Stock Deduction]
        UC9[Automatic Stock Restoration]
        UC10[Order Status Transition Validation]
    end

    Client --> UC1
    Client --> UC2
    Client --> UC3
    Client --> UC4
    Client --> UC5
    Client --> UC6
    Client --> UC7

    UC2 --> UC8
    UC2 --> UC9
    UC2 --> UC10
```

---

## 3. Domain Class Diagram

```mermaid
classDiagram
    class AppModule

    class ProductsController {
        +findAll()
        +findOne(id)
        +create(dto)
        +update(id, dto)
        +patch(id, dto)
        +remove(id)
        +findCustomersByProduct(id)
        +mostBoughtInsights(limit)
    }

    class OrdersController {
        +findAll()
        +findOne(id)
        +create(dto)
        +patch(id, dto)
        +remove(id)
    }

    class CustomersController {
        +findAll()
        +findOne(id)
        +create(dto)
        +update(id, dto)
        +patch(id, dto)
        +remove(id)
        +findOrders(id)
        +topBuyers(limit)
    }

    class ProductsService {
        +findAll() Product[]
        +findOne(id) Product
        +create(dto) Product
        +update(id, dto) Product
        +patch(id, dto) Product
        +remove(id) Product
        +deductStock(productId, quantity) Product
        +restoreStock(productId, quantity) Product
        +findCustomersByProduct(productId)
        +findMostBoughtProducts(limit)
    }

    class OrdersService {
        +findAll() Order[]
        +findOne(id) Order
        +create(dto) Order
        +patch(id, dto) Order
        +remove(id) Order
        -restoreOrderStock(order)
    }

    class CustomersService {
        +findAll() Customer[]
        +findOne(id) Customer
        +create(dto) Customer
        +update(id, dto) Customer
        +patch(id, dto) Customer
        +remove(id) Customer
        +getOrdersByCustomer(id)
        +getTopBuyers(limit)
        +hasCustomer(id) boolean
        -ensureUniqueEmailAndPhone(email, phone, ignoreId)
    }

    class JsonFileRepository~T~ {
        -data T[]
        -isLoaded boolean
        -filePath string
        -writeQueue Promise~void~
        -loadFromFile()
        -saveToFile()
        -ensureLoaded()
        +findAll() T[]
        +findById(id) T
        +create(entity) T
        +update(id, entity) T
        +delete(id) T
    }

    class ProductsRepository {
        +findBySku(sku, excludeId) Product
    }

    class OrdersRepository
    class CustomersRepository

    AppModule --> ProductsController
    AppModule --> OrdersController
    AppModule --> CustomersController
    AppModule --> ProductsService
    AppModule --> OrdersService
    AppModule --> CustomersService
    AppModule --> ProductsRepository
    AppModule --> OrdersRepository
    AppModule --> CustomersRepository

    ProductsController --> ProductsService
    OrdersController --> OrdersService
    CustomersController --> CustomersService

    ProductsService --> ProductsRepository
    ProductsService --> OrdersRepository
    ProductsService --> CustomersRepository

    OrdersService --> OrdersRepository
    OrdersService --> ProductsService
    OrdersService --> CustomersService

    CustomersService --> CustomersRepository
    CustomersService --> OrdersRepository

    JsonFileRepository <|-- ProductsRepository
    JsonFileRepository <|-- OrdersRepository
    JsonFileRepository <|-- CustomersRepository
```

---

## 4. Entity and DTO Class Diagram

```mermaid
classDiagram
    class BaseEntity {
        +id string
        +createdAt string
        +updatedAt string
    }

    class Product {
        +name string
        +description string
        +price number
        +stockQuantity number
        +sku string
        +category ProductCategory
        +brand string
        +images string[]
        +weight number | null
        +status ProductStatus
    }

    class Customer {
        +fullName string
        +email string
        +phone string
        +address string
        +status CustomerStatus
    }

    class Order {
        +customerId string
        +items OrderItem[]
        +totalAmount number
        +status OrderStatus
        +paymentMethod PaymentMethod
        +shippingAddress string
        +trackingNumber string | null
        +note string | null
        +placedAt string
    }

    class OrderItem {
        +productId string
        +productName string
        +priceAtPurchase number
        +quantity number
        +subtotal number
    }

    class CreateProductDto {
        +name string
        +description string
        +price number
        +stockQuantity number
        +sku string
        +category ProductCategory
        +brand string
        +images string[]
        +weight number
        +status ProductStatus
    }

    class UpdateProductDto {
        +name string
        +description string
        +price number
        +stockQuantity number
        +sku string
        +category ProductCategory
        +brand string
        +images string[]
        +weight number
        +status ProductStatus
    }

    class PatchProductDto {
        +name string
        +description string
        +price number
        +stockQuantity number
        +sku string
        +category ProductCategory
        +brand string
        +images string[]
        +weight number
        +status ProductStatus
    }

    class CreateCustomerDto {
        +fullName string
        +email string
        +phone string
        +address string
        +status CustomerStatus
    }

    class UpdateCustomerDto {
        +fullName string
        +email string
        +phone string
        +address string
        +status CustomerStatus
    }

    class PatchCustomerDto {
        +fullName string
        +email string
        +phone string
        +address string
        +status CustomerStatus
    }

    class CreateOrderDto {
        +customerId string
        +items CreateOrderItemDto[]
        +paymentMethod PaymentMethod
        +shippingAddress string
        +note string
    }

    class CreateOrderItemDto {
        +productId string
        +quantity number
    }

    class PatchOrderDto {
        +status OrderStatus
        +trackingNumber string
        +note string
    }

    class ProductCategory {
        <<enumeration>>
        ELECTRONICS
        CLOTHING
        HOME
        BEAUTY
        OTHER
    }

    class ProductStatus {
        <<enumeration>>
        ACTIVE
        OUT_OF_STOCK
        DISCONTINUED
    }

    class CustomerStatus {
        <<enumeration>>
        ACTIVE
        INACTIVE
    }

    class OrderStatus {
        <<enumeration>>
        PENDING
        PAID
        SHIPPED
        COMPLETED
        CANCELLED
    }

    class PaymentMethod {
        <<enumeration>>
        CREDIT_CARD
        BANK_TRANSFER
        COD
    }

    BaseEntity <|-- Product
    BaseEntity <|-- Customer
    BaseEntity <|-- Order

    Order *-- OrderItem
    Order --> OrderStatus
    Order --> PaymentMethod
    Product --> ProductCategory
    Product --> ProductStatus
    Customer --> CustomerStatus

    CreateProductDto --> ProductCategory
    CreateProductDto --> ProductStatus
    UpdateProductDto --> ProductCategory
    UpdateProductDto --> ProductStatus
    PatchProductDto --> ProductCategory
    PatchProductDto --> ProductStatus
    CreateCustomerDto --> CustomerStatus
    UpdateCustomerDto --> CustomerStatus
    PatchCustomerDto --> CustomerStatus
    CreateOrderDto --> PaymentMethod
    CreateOrderDto *-- CreateOrderItemDto
    PatchOrderDto --> OrderStatus
```

---

## 5. Sequence Diagram — Create Order

```mermaid
sequenceDiagram
    actor Client
    participant OC as OrdersController
    participant OS as OrdersService
    participant CS as CustomersService
    participant PS as ProductsService
    participant OR as OrdersRepository

    Client->>OC: POST /orders
    OC->>OS: create(dto)
    OS->>CS: hasCustomer(customerId)
    CS-->>OS: true/false

    loop each item in dto.items
        OS->>PS: findOne(productId)
        PS-->>OS: Product
        OS->>OS: validate ACTIVE and stock
        OS->>PS: deductStock(productId, quantity)
        PS-->>OS: updated Product
        OS->>OS: build OrderItem snapshot
    end

    OS->>OS: calculate totalAmount
    OS->>OR: create(order)
    OR-->>OS: Order
    OS-->>OC: Order
    OC-->>Client: ApiResponse<Order>

    Note over OS,PS: If any item fails after some stock was deducted,\nOrdersService rolls back with restoreStock().
```

---

## 6. Sequence Diagram — Product Buyer Insight

```mermaid
sequenceDiagram
    actor Client
    participant PC as ProductsController
    participant PS as ProductsService
    participant PR as ProductsRepository
    participant OR as OrdersRepository
    participant CR as CustomersRepository

    Client->>PC: GET /products/:id/customers
    PC->>PS: findCustomersByProduct(productId)
    PS->>PR: findById(productId)
    PR-->>PS: Product | null
    PS->>OR: findAll()
    OR-->>PS: Order[]
    PS->>CR: findAll()
    CR-->>PS: Customer[]
    PS->>PS: aggregate order items by customer
    PS-->>PC: buyers summary[]
    PC-->>Client: ApiResponse<summary[]>
```

---

## 7. Activity Diagram — Customer Deletion Rule

```mermaid
flowchart TD
    A[Request DELETE /customers/:id] --> B[Find customer by id]
    B --> C{Customer exists?}
    C -- No --> D[Throw 404 Not Found]
    C -- Yes --> E[Load all orders]
    E --> F{Has any order with customerId?}
    F -- Yes --> G[Throw 400 BadRequest\nCustomer has order history]
    F -- No --> H[Delete customer from repository]
    H --> I[Return deleted customer]
```

---

## 8. State Diagram — Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING
    PENDING --> PAID
    PENDING --> CANCELLED
    PAID --> SHIPPED
    PAID --> CANCELLED
    SHIPPED --> COMPLETED
    CANCELLED --> [*]
    COMPLETED --> [*]
```

### Transition Rules

- `PENDING` ไปได้เฉพาะ `PAID` หรือ `CANCELLED`
- `PAID` ไปได้เฉพาะ `SHIPPED` หรือ `CANCELLED`
- `SHIPPED` ไปได้เฉพาะ `COMPLETED`
- `COMPLETED` และ `CANCELLED` เป็น terminal state

---

## 9. Persistence Diagram

```mermaid
flowchart TB
    subgraph Memory Layer
        ProductsData[Product list]
        OrdersData[Order list]
        CustomersData[Customer list]
    end

    subgraph Repository Layer
        JFR[JsonFileRepository Generic\nLazy Load + Atomic Write + Write Queue]
    end

    subgraph File Storage
        P[(data/products.json)]
        O[(data/orders.json)]
        C[(data/customers.json)]
    end

    JFR --> ProductsData
    JFR --> OrdersData
    JFR --> CustomersData
    JFR --> P
    JFR --> O
    JFR --> C
```

---

## 10. Notes for Presentation

- ระบบนี้ไม่ได้มีเพียง 2 core models ตามโจทย์เดิมอีกต่อไป แต่ขยายเป็น 3 domains ที่เชื่อมกันคือ `Product`, `Order`, `Customer`
- `OrdersService` เป็นศูนย์กลางของ business workflow ที่ซับซ้อนที่สุด เพราะต้อง validate ลูกค้า, ตรวจสินค้า, ตัดสต็อก, ทำ rollback และควบคุม state transition
- `ProductsService` มีทั้ง CRUD และ analytics ข้ามโดเมน เช่น most-bought products และ customers by product
- `CustomersService` มีทั้ง CRUD, order history summary และ top buyers
- repository layer ใช้ generic base class เดียวกันทั้งหมดเพื่อแยก business logic ออกจาก file persistence


# [UML](https://app.eraser.io/workspace/qg7vUC9e9wsu1svcCybN?origin=share)