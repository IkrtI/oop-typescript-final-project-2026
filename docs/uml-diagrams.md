# System UML Diagrams

## 1. System Architecture

```mermaid
flowchart TB
    Client[Client / Browser] --> API[REST API]
    Client --> Swagger[Swagger UI]

    subgraph NestJS Application
        Main[main.ts] --> AppModule

        subgraph Modules [Global Modules]
            ProductsModule
            OrdersModule
            CustomersModule
        end

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

    AppModule --> ProductsModule
    AppModule --> OrdersModule
    AppModule --> CustomersModule

    ProductsModule --> ProductsController
    ProductsModule --> ProductsService
    ProductsModule --> ProductsRepository

    OrdersModule --> OrdersController
    OrdersModule --> OrdersService
    OrdersModule --> OrdersRepository

    CustomersModule --> CustomersController
    CustomersModule --> CustomersService
    CustomersModule --> CustomersRepository

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

    subgraph File Storage
        JsonFileRepository --> ProductsJson[(products.json)]
        JsonFileRepository --> OrdersJson[(orders.json)]
        JsonFileRepository --> CustomersJson[(customers.json)]
    end
```

## 2. Component Class Diagram

```mermaid
classDiagram
    class AppModule

    class ProductsModule {
        <<Global>>
    }
    class OrdersModule {
        <<Global>>
    }
    class CustomersModule {
        <<Global>>
    }

    class ProductsController {
        +findAll() Product[]
        +findOne(id) Product
        +create(dto) Product
        +update(id, dto) Product
        +patch(id, dto) Product
        +remove(id) Product
        +findCustomersByProduct(id)
        +mostBoughtInsights(limit)
    }

    class OrdersController {
        +findAll() Order[]
        +findOne(id) Order
        +create(dto) Order
        +patch(id, dto) Order
        +remove(id) Order
    }

    class CustomersController {
        +findAll() Customer[]
        +findOne(id) Customer
        +create(dto) Customer
        +update(id, dto) Customer
        +patch(id, dto) Customer
        +remove(id) Customer
        +findOrders(id) Order[]
        +topBuyers(limit)
    }

    class ProductsService {
        +findAll()
        +findOne(id)
        +create(dto)
        +update(id, dto)
        +patch(id, dto)
        +remove(id)
        +deductStock(productId, quantity)
        +restoreStock(productId, quantity)
        +findCustomersByProduct(productId)
        +findMostBoughtProducts(limit)
    }

    class OrdersService {
        +findAll()
        +findOne(id)
        +create(dto)
        +patch(id, dto)
        +remove(id)
        -restoreOrderStock(order)
    }

    class CustomersService {
        +findAll()
        +findOne(id)
        +create(dto)
        +update(id, dto)
        +patch(id, dto)
        +remove(id)
        +getOrdersByCustomer(id)
        +getTopBuyers(limit)
        +hasCustomer(id)
        -ensureUniqueEmailAndPhone(email, phone, ignoreId)
    }

    class JsonFileRepository~T~ {
        -data: T[]
        -filePath: string
        -loadFromFile()
        -saveToFile()
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

    AppModule --> ProductsModule
    AppModule --> OrdersModule
    AppModule --> CustomersModule

    ProductsModule --> ProductsController
    ProductsModule --> ProductsService
    ProductsModule --> ProductsRepository

    OrdersModule --> OrdersController
    OrdersModule --> OrdersService
    OrdersModule --> OrdersRepository

    CustomersModule --> CustomersController
    CustomersModule --> CustomersService
    CustomersModule --> CustomersRepository

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

## 3. Entity and DTO Diagram

```mermaid
classDiagram
    class BaseEntity {
        +id: string
        +createdAt: Date
        +updatedAt: Date
    }

    class Product {
        +name: string
        +description: string
        +price: number
        +stockQuantity: number
        +sku: string
        +category: ProductCategory
        +brand: string
        +images: string[]
        +weight: number
        +status: ProductStatus
    }

    class Customer {
        +fullName: string
        +email: string
        +phone: string
        +address: string
        +status: CustomerStatus
    }

    class Order {
        +customerId: string
        +items: OrderItem[]
        +totalAmount: number
        +status: OrderStatus
        +paymentMethod: PaymentMethod
        +shippingAddress: string
        +trackingNumber: string
        +note: string
        +placedAt: Date
    }

    class OrderItem {
        +productId: string
        +productName: string
        +priceAtPurchase: number
        +quantity: number
        +subtotal: number
    }

    class CreateOrderDto {
        +customerId: string
        +items: CreateOrderItemDto[]
        +paymentMethod: PaymentMethod
        +shippingAddress: string
        +note: string
    }

    class CreateOrderItemDto {
        +productId: string
        +quantity: number
    }

    class PatchOrderDto {
        +status: OrderStatus
        +trackingNumber: string
        +note: string
    }

    BaseEntity <|-- Product
    BaseEntity <|-- Customer
    BaseEntity <|-- Order

    Order *-- OrderItem
    Order ..> CreateOrderDto : Created from
    CreateOrderDto *-- CreateOrderItemDto
```

## 4. Sequence Diagram: Order Creation with Global Modules

```mermaid
sequenceDiagram
    actor Client
    participant OC as OrdersController
    participant OS as OrdersService
    participant CS as CustomersService (Global)
    participant PS as ProductsService (Global)
    participant OR as OrdersRepository
    participant DB as JSON Data (orders.json)

    Client->>OC: POST /orders
    OC->>OS: create(dto)
    
    %% Cross-module dependencies are resolved via Global Modules
    OS->>CS: hasCustomer(customerId)
    CS-->>OS: true/false

    loop each item in dto.items
        OS->>PS: findOne(productId)
        PS-->>OS: Product
        OS->>OS: validate ACTIVE and stock bounds
        OS->>PS: deductStock(productId, quantity)
        PS-->>OS: updated Product (stock reduced)
        OS->>OS: build OrderItem snapshot (copy price)
    end

    OS->>OS: calculate totalAmount
    OS->>OR: create(order)
    OR->>DB: append to orders.json (via JsonFileRepository)
    DB-->>OR: file saved
    OR-->>OS: Order created
    OS-->>OC: Order
    OC-->>Client: 201 Created ApiResponse<Order>

    Note over OS,PS: Rollback: If any validation fails,\nOrdersService calls restoreStock() for affected items.
```

## 5. Sequence Diagram: Data Insights (Most Bought / Top Buyers)

```mermaid
sequenceDiagram
    actor Admin
    participant PC as ProductsController
    participant PS as ProductsService
    participant OR as OrdersRepository (Global)

    Admin->>PC: GET /products/:id/customers
    PC->>PS: findCustomersByProduct(productId)
    
    PS->>OR: findAll()
    OR-->>PS: All Orders[]
    
    PS->>PS: filter orders containing productId
    PS->>PS: extract customerIds & aggregate purchases
    
    PS-->>PC: Customers Summary Array
    PC-->>Admin: 200 OK
```

## 6. Activity Diagram: Customer Deletion (Foreign Key Check)

```mermaid
flowchart TD
    Start((Start)) --> Req[DELETE /customers/:id]
    Req --> Find[Find Customer in CustomersRepository]
    Find --> Exists{Exists?}
    Exists -- No --> Err404[Throw 404 NotFoundException]
    Exists -- Yes --> CheckOrders[Get all orders via OrdersRepository]
    CheckOrders --> HasOrders{Has Orders?}
    HasOrders -- Yes --> Err400[Throw 400 BadRequestException\n'Cannot delete customer with order history']
    HasOrders -- No --> Delete[Delete from CustomersRepository]
    Delete --> Success[Return deleted Customer]
    Err404 --> End((End))
    Err400 --> End
    Success --> End
```

## 7. State Diagram: Order Lifecycle

```mermaid
stateDiagram-v2
    [*] --> PENDING : create()
    
    PENDING --> PAID : patch(status=PAID)
    PENDING --> CANCELLED : patch(status=CANCELLED)
    
    PAID --> SHIPPED : patch(status=SHIPPED)
    PAID --> CANCELLED : patch(status=CANCELLED)
    
    SHIPPED --> COMPLETED : patch(status=COMPLETED)
    
    CANCELLED --> [*] : rollback stock if canceled before shipped? (implementation specific)
    COMPLETED --> [*]
```