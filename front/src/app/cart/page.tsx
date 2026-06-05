"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";
import {
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  type CartItem,
} from "@/lib/cart";
import type { RsData } from "@/type/rsData";
import type { UserDto } from "@/type/account";
import type { OrderDto } from "@/type/order";

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [addressDetail, setAddressDetail] = useState("");
  const [postcode, setPostcode] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setCartItems(getCart());
  }, []);

  const syncCart = (updater: () => void) => {
    updater();
    setCartItems(getCart());
  };

  const handleQuantity = (itemId: number, delta: number) => {
    syncCart(() => {
      const item = cartItems.find((c) => c.itemId === itemId);
      if (!item) return;
      const next = Math.max(1, item.quantity + delta);
      updateCartQuantity(itemId, next);
    });
  };

  const handleRemove = (itemId: number) => {
    syncCart(() => removeFromCart(itemId));
  };

  const total = cartItems.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert("장바구니에 상품이 없습니다.");
      return;
    }
    if (!email.trim() || !name.trim() || !address.trim() || !postcode.trim()) {
      alert("이름, 이메일, 주소, 우편번호를 모두 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      // 1. 이메일로 기존 고객 조회 (없으면 신규 등록)
      const allUsers: UserDto[] = await apiFetch("/api/users");
      let userId: number;
      const existingUser = allUsers.find(
        (u) => u.email === email.trim()
      );
      if (existingUser) {
        userId = existingUser.id;
      } else {
        const userRes: RsData<UserDto> = await apiFetch("/api/users", {
          method: "POST",
          body: JSON.stringify({ email: email.trim(), name: name.trim() }),
        });
        userId = userRes.data.id;
      }

      // 2. 주문 생성 (당일 기존 주문 있으면 백엔드가 자동 병합하여 반환)
      const orderRes: RsData<OrderDto> = await apiFetch("/api/orders", {
        method: "POST",
        body: JSON.stringify({
          userId,
          address: address.trim(),
          addressDetail: addressDetail.trim(),
          postcode: postcode.trim(),
        }),
      });
      const orderId = orderRes.data.id;

      // 3. 장바구니 품목을 주문에 추가
      await Promise.all(
        cartItems.map((item) =>
          apiFetch(`/api/orders/${orderId}/details`, {
            method: "POST",
            body: JSON.stringify({
              itemId: item.itemId,
              itemQuantity: item.quantity,
            }),
          })
        )
      );

      clearCart();
      router.push(
        `/order/${orderId}?email=${encodeURIComponent(email.trim())}`
      );
    } catch (err) {
      console.error(err);
      alert("주문 처리 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="text-center py-5 border-b border-gray-100">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight hover:opacity-70 transition-opacity"
        >
          !Five Guys coffee
        </Link>
      </header>

      <main className="flex-1 p-6">
        <div className="max-w-3xl mx-auto flex gap-6">
          {/* Cart Section */}
          <div className="flex-1 border border-gray-300 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
              <h2 className="text-base font-semibold">cart</h2>
              {cartItems.length > 0 && (
                <button
                  onClick={() => {
                    if (!confirm("장바구니를 비우시겠습니까?")) return;
                    clearCart();
                    setCartItems([]);
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  전체 비우기
                </button>
              )}
            </div>

            {cartItems.length === 0 && (
              <p className="text-sm text-gray-400 text-center py-10">
                장바구니가 비어있습니다.
              </p>
            )}

            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.itemId} className="flex gap-3 items-start">
                  <div className="w-16 h-16 rounded-xl flex-shrink-0 overflow-hidden">
                    <Image src="/coffee_bean.jpg" alt={item.name} width={64} height={64} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{item.name}</p>
                    <p className="text-xs text-gray-500 mb-2">
                      {item.price.toLocaleString()}원
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleQuantity(item.itemId, -1)}
                        className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-sm hover:bg-gray-50"
                      >
                        -
                      </button>
                      <span className="text-sm w-7 text-center font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantity(item.itemId, 1)}
                        className="w-6 h-6 border border-gray-300 rounded flex items-center justify-center text-sm hover:bg-gray-50"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemove(item.itemId)}
                    className="bg-red-400 text-white text-xs px-3 py-1.5 rounded-lg hover:bg-red-500 transition-colors flex-shrink-0"
                  >
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Personal Info + Checkout */}
          <div className="w-64 flex flex-col gap-5">
            <div>
              <h2 className="text-base font-semibold mb-4 pb-3 border-b border-gray-200">
                배송 정보
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-gray-500 block mb-1">이름</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">이메일</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">주소</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    상세주소 <span className="text-gray-400">(선택)</span>
                  </label>
                  <input
                    type="text"
                    value={addressDetail}
                    onChange={(e) => setAddressDetail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-500 block mb-1">우편번호</label>
                  <input
                    type="text"
                    value={postcode}
                    onChange={(e) => setPostcode(e.target.value)}
                    inputMode="numeric"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4 leading-relaxed">
                당일 오후 2시 이후의 주문은 다음 날 발송됩니다.
              </p>
            </div>

            <div className="mt-auto">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">총 금액</span>
                <span className="text-lg font-bold">{total.toLocaleString()}원</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "처리중..." : "결제하기"}
              </button>
            </div>
          </div>
        </div>
      </main>

      <footer className="text-center py-3 border-t border-gray-100 text-gray-400 text-xs">
        ⓒ 2026 !Five_Guys All rights reserved.
      </footer>
    </div>
  );
}
