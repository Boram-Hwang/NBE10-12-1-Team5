export type ProductDto = {
  id: number;
  createDate: string;
  modifyDate: string;
  name: string;
  price: number;
  inventory: number;
  description: string;
};

// 점진적 리팩토링 호환성을 위해 임시 유지
export type ItemDto = ProductDto;
