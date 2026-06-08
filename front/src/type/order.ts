export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "주문확인중",
  PROCESSING: "처리중",
  SHIPPED: "발송완료",
  DELIVERED: "배송완료",
  CANCELED: "취소",
};

export type OrderDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  userId: number;
  address: string;
  addressDetail: string;
  postcode: string;
  status: OrderStatus;
  totalPrice: number;
  deliveryDate: string; // YYYY-MM-DD
};

export type OrderItemDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  orderId: number;
  itemId: number;
  itemQuantity: number;
  itemName: string;
  itemPrice: number;
};
