export enum OrderStatus {
  PENDING = "PENDING",
  PAID = "PAID",
  SHIPPED = "SHIPPED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export const VALID_ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.PAID, OrderStatus.CANCELLED],
  [OrderStatus.PAID]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
};
