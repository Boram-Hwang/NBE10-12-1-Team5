"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

export default function OrderCompletePage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="border border-gray-300 rounded-2xl p-10 text-center max-w-sm w-full bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-6">주문 완료</h2>
        <p className="text-gray-700 mb-8 text-sm leading-relaxed">
          {email && (
            <span className="inline-block border border-gray-300 rounded px-2 py-1 text-xs font-medium mr-1">
              {email}
            </span>
          )}
          님 주문이 완료되었습니다.
        </p>
        <Link
          href="/"
          className="text-gray-600 text-sm border-b border-gray-400 hover:text-gray-900 hover:border-gray-600 transition-colors"
        >
          메인 페이지 돌아가기
        </Link>
      </div>
    </div>
  );
}
