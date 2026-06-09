"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";
import { getCart, clearCart, type CartItem } from "@/lib/cart";
import type { RsData } from "@/type/rsData";
import type { UserDto } from "@/type/account";
import type { OrderDto } from "@/type/order";

const CHECKOUT_INFO_KEY = "fiveguys_checkout";

type CheckoutInfo = {
  email: string;
  address: string;
  addressDetail: string;
  postcode: string;
};

export default function OrderConfirmPage() {
  const router = useRouter();
  const [info, setInfo] = useState<CheckoutInfo | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem(CHECKOUT_INFO_KEY);
    if (!raw) {
      router.replace("/cart");
      return;
    }
    setInfo(JSON.parse(raw));
    setCartItems(getCart());
  }, [router]);

  const total = cartItems.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handleConfirm = async () => {
    if (!info || cartItems.length === 0) return;
    setSubmitting(true);
    try {
      // 1. 이메일로 기존 유저 조회, 없으면 신규 등록
      const allUsers: UserDto[] = await apiFetch("/api/user");
      let userId: number;
      const existing = allUsers.find((u) => u.email === info.email);
      if (existing) {
        userId = existing.id;
      } else {
        const userRes: RsData<UserDto> = await apiFetch("/api/user", {
          method: "POST",
          body: JSON.stringify({
            email: info.email,
            address: info.address,
            addressDetail: info.addressDetail,
            postcode: info.postcode,
          }),
        });
        userId = userRes.data.id;
      }

      // 2. 주문 + 주문 품목 한 번에 생성
      const orderRes: RsData<OrderDto> = await apiFetch("/api/order", {
        method: "POST",
        body: JSON.stringify({
          userId,
          address: info.address,
          addressDetail: info.addressDetail,
          postcode: info.postcode,
          status: "PENDING",
          totalPrice: total,
          orderProducts: cartItems.map((c) => ({
            productId: c.productId,
            productQuantity: c.quantity,
          })),
        }),
      });

      clearCart();
      sessionStorage.removeItem(CHECKOUT_INFO_KEY);
      router.push(`/order/complete?email=${encodeURIComponent(info.email)}`);
    } catch (err) {
      console.error(err);
      alert("주문 처리 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!info) return null;

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="text-center py-5 border-b border-gray-100">
        <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-70 transition-opacity">
          !Five Guys coffee
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="border border-gray-300 rounded-2xl p-8 w-full max-w-md flex flex-col gap-6">
          <h2 className="text-lg font-bold pb-3 border-b border-gray-200">주문 확인</h2>

          {/* 배송 정보 */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">배송 정보</h3>
            <div className="space-y-2.5">
              {[
                ["이메일", info.email],
                ["주소", info.address],
                ["상세주소", info.addressDetail || "-"],
                ["우편번호", info.postcode],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-20 flex-shrink-0">{label}</span>
                  <div className="flex-1 border-b border-gray-100 pb-1">
                    <span className="text-sm">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 주문 품목 */}
          <section>
            <h3 className="text-sm font-semibold mb-3 text-gray-700">주문 품목</h3>
            {cartItems.length === 0 ? (
              <p className="text-sm text-gray-400">장바구니가 비어있습니다.</p>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                      <Image src="/coffee_bean.jpg" alt={item.name} width={40} height={40} className="w-full h-full object-cover" />
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">{item.name}</span>
                    <span className="text-sm text-gray-500 flex-shrink-0">×{item.quantity}</span>
                    <span className="text-sm font-medium flex-shrink-0">
                      {(item.price * item.quantity).toLocaleString()}원
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-sm font-semibold">총 금액</span>
                  <span className="text-lg font-bold">{total.toLocaleString()}원</span>
                </div>
              </div>
            )}
          </section>

          {/* 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => router.back()}
              className="flex-1 border border-gray-300 rounded-xl py-3 text-sm hover:bg-gray-50 transition-colors"
            >
              돌아가기
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting || cartItems.length === 0}
              className="flex-1 bg-gray-900 text-white rounded-xl py-3 text-sm font-semibold hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "처리중..." : "주문 확정하기"}
            </button>
          </div>
        </div>
      </main>

      <footer className="text-center py-3 border-t border-gray-100 text-gray-400 text-xs">
        ⓒ 2026 !Five_Guys All rights reserved.
      </footer>
    </div>
  );
}
