"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";
import type { OrderProductDto, OrderDto } from "@/type/order";
import type { UserDto } from "@/type/account";
import type { RsData } from "@/type/rsData";

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderDto | null>(null);
  const [user, setUser] = useState<UserDto | null>(null);
  const [details, setDetails] = useState<OrderProductDto[]>([]);
  const [loading, setLoading] = useState(true);

  const emailParam = searchParams.get("email") ?? "";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orderData, detailRes] = await Promise.all([
          apiFetch(`/api/order/${id}`) as Promise<OrderDto>,
          apiFetch(`/api/order/${id}/product`) as Promise<RsData<OrderProductDto[]>>,
        ]);
        setOrder(orderData);
        setDetails(detailRes.data ?? []);

        const userData: UserDto = await apiFetch(`/api/user/${orderData.userId}`);
        setUser(userData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  const handleOrder = () => {
    router.push("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400 text-sm">
        로딩중...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="text-center py-5 border-b border-gray-100">
        <Link
          href="/"
          className="text-2xl font-bold tracking-tight hover:opacity-70 transition-opacity"
        >
          !Five Guys Coffee
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="border border-gray-300 rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-lg font-bold mb-6 pb-3 border-b border-gray-200">
            주문 상세
          </h2>

          {/* 고객 / 배송 정보 */}
          <section className="mb-6">
            <h3 className="text-sm font-semibold mb-3">배송 정보</h3>
            <div className="space-y-3">
              {[
                { label: "이메일", value: user?.email ?? "-" },
                { label: "주소", value: order?.address ?? "-" },
                { label: "상세주소", value: order?.addressDetail || "-" },
                { label: "우편번호", value: order?.postcode ?? "-" },
                { label: "배송예정일", value: order?.deliveryDate ?? "-" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 w-24 flex-shrink-0">
                    {label}
                  </span>
                  <div className="flex-1 border-b border-gray-200 pb-1">
                    <span className="text-sm">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* 상품 내역 */}
          <section className="mb-8">
            <h3 className="text-sm font-semibold mb-3">상품 내역</h3>
            {details.length === 0 ? (
              <p className="text-sm text-gray-400">주문 상품 내역이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {details.map((detail) => (
                  <div key={detail.id} className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-lg">☕</span>
                    </div>
                    <span className="flex-1 text-sm font-medium">
                      {detail.productName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {detail.productPrice.toLocaleString()}원
                    </span>
                    <span className="text-sm text-gray-500">
                      {detail.productQuantity}개
                    </span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-sm font-semibold">합계</span>
                  <span className="text-base font-bold">
                    {order?.totalPrice.toLocaleString()}원
                  </span>
                </div>
              </div>
            )}
          </section>

          {/* 주문하기 */}
          <div className="flex items-center gap-4">
            <div>
              <span className="text-xs text-gray-500 block">주문번호</span>
              <span className="text-base font-bold">#{order?.id}</span>
            </div>
            <button
              onClick={handleOrder}
              className="flex-1 bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
            >
              확인
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
