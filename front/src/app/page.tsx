"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/backend/client";
import { getCart } from "@/lib/cart";
import type { ItemDto } from "@/type/product";

const PAGE_SIZE = 9;

export default function MainPage() {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    apiFetch("/api/items")
      .then(setItems)
      .finally(() => setLoading(false));
    setCartCount(getCart().reduce((sum, c) => sum + c.quantity, 0));
  }, []);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const paged = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="min-h-screen flex">
      {/* Main Container */}
      <div className="flex-1 m-4 border border-gray-300 rounded-2xl flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <header className="text-center py-5 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-70 transition-opacity">!Five Guys Coffee</Link>
        </header>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <h2 className="text-base font-semibold">상품 목록</h2>
          <Link href="/cart" className="relative text-sm border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
            🛒 장바구니
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Product Grid */}
        <main className="flex-1 px-6 pb-4 overflow-y-auto">
          {loading && (
            <div className="text-center text-gray-400 py-20 text-sm">로딩중...</div>
          )}

          {!loading && items.length === 0 && (
            <div className="text-center text-gray-400 py-20 text-sm">
              등록된 상품이 없습니다.
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            {paged.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="bg-white border border-gray-300 rounded-2xl aspect-square flex flex-col items-center justify-center p-4 hover:shadow-xl hover:border-transparent transition-all duration-200 group"
              >
                <div className="w-50 h-50 rounded-xl mb-3 overflow-hidden">
                  <Image src="/coffee_bean.jpg" alt={item.name} width={56} height={56} className="w-full h-full object-cover" />
                </div>
                <p className="font-semibold text-sm text-center text-gray-800 leading-tight">
                  {item.name}
                </p>
                <p className="text-xl text-gray-550 font-bold mt-1">
                  {item.price.toLocaleString()}원
                </p>
                <p className={`text-xs mt-0.5 ${item.inventory === 0 ? "text-red-400" : "text-gray-400"}`}>
                  {item.inventory === 0 ? "품절" : `재고 ${item.inventory}개`}
                </p>
              </Link>
            ))}
          </div>
        </main>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 py-3">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-gray-900 text-white"
                    : "border border-gray-200 hover:bg-gray-50 text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-sm hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              ›
            </button>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center py-3 border-t border-gray-100 text-gray-400 text-xs">
          ⓒ 2026 !Five_Guys All rights reserved.
        </footer>
      </div>

    </div>
  );
}
