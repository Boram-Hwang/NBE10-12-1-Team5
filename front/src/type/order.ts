export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "주문확인중",
  PROCESSING: "처리중",
  SHIPPED: "발송완료",
  DELIVERED: "배송완료",
  CANCELLED: "취소",
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

export type OrderDetailDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  orderId: number;
  itemId: number;
  itemQuantity: number;
  itemName: string;
  itemPrice: number;
};
