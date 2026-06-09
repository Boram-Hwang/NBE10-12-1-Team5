export type CartItem = {
  productId: number;
  name: string;
  price: number;
  quantity: number;
};

const CART_KEY = "fiveguys_cart";

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(sessionStorage.getItem(CART_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addToCart(item: Omit<CartItem, "quantity">): void {
  const cart = getCart();
  const existing = cart.find((c) => c.productId === item.productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...item, quantity: 1 });
  }
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function updateCartQuantity(productId: number, quantity: number): void {
  const cart = getCart().map((c) =>
    c.productId === productId ? { ...c, quantity } : c
  );
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function removeFromCart(productId: number): void {
  const cart = getCart().filter((c) => c.productId !== productId);
  sessionStorage.setItem(CART_KEY, JSON.stringify(cart));
}

export function clearCart(): void {
  sessionStorage.removeItem(CART_KEY);
}
