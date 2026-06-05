"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";
import { addToCart, getCart } from "@/lib/cart";
import type { ItemDto } from "@/type/product";

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [item, setItem] = useState<ItemDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(getCart().reduce((sum, c) => sum + c.quantity, 0));
    apiFetch(`/api/items/${id}`)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!item) return;
    for (let i = 0; i < quantity; i++) {
      addToCart({ itemId: item.id, name: item.name, price: item.price });
    }
    const newCount = getCart().reduce((sum, c) => sum + c.quantity, 0);
    setCartCount(newCount);
    setToast(`장바구니에 ${quantity}개 담았습니다.`);
    setTimeout(() => setToast(null), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        로딩중...
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-sm">상품을 찾을 수 없습니다.</p>
        <button onClick={() => router.back()} className="text-sm text-gray-400 underline">
          돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="w-24" />
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight hover:opacity-70 transition-opacity"
        >
          !Five Guys Coffee
        </Link>
        <div className="w-24 flex justify-end">
          <Link href="/cart" className="relative text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
            🛒 장바구니
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="border border-gray-300 rounded-2xl p-8 w-full max-w-sm flex flex-col gap-6">
          {/* 상품 이미지 */}
          <div className="w-full aspect-square rounded-2xl overflow-hidden">
            <Image src="/coffee_bean.jpg" alt={item.name} width={400} height={400} className="w-full h-full object-cover" />
          </div>

          {/* 상품 정보 */}
          <div className="flex flex-col gap-3">
            <h2 className="text-xl font-bold text-gray-900">{item.name}</h2>

            {item.description && (
              <p className="text-sm text-gray-500 leading-relaxed">{item.description}</p>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500">가격</span>
              <span className="text-lg font-bold text-gray-900">
                {item.price.toLocaleString()}원
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">재고</span>
              <span className={`text-sm font-medium ${item.inventory === 0 ? "text-red-500" : "text-gray-700"}`}>
                {item.inventory === 0 ? "품절" : `${item.inventory}개`}
              </span>
            </div>
          </div>

          {/* 수량 선택 */}
          {item.inventory > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">수량</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(item.inventory, q + 1))}
                  className="w-8 h-8 border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => router.back()}
              className="flex-1 border border-gray-300 rounded-xl py-3 text-sm hover:bg-gray-50 transition-colors"
            >
              돌아가기
            </button>
            <button
              onClick={handleAddToCart}
              disabled={item.inventory === 0}
              className="flex-1 bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {item.inventory === 0 ? "품절" : "장바구니 추가"}
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center py-3 border-t border-gray-100 text-gray-400 text-xs">
        ⓒ 2026 !Five_Guys All rights reserved.
      </footer>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-sm px-4 py-2 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
