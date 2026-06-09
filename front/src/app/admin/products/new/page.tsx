"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/backend/client";
import type { ProductDto } from "@/type/product";
import type { RsData } from "@/type/rsData";

export default function ProductNewPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    price: "",
    inventory: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const updateForm = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || form.name.length < 2) {
      alert("상품명은 2자 이상 입력해주세요.");
      return;
    }
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) {
      alert("가격을 올바르게 입력해주세요.");
      return;
    }
    if (
      !form.inventory ||
      isNaN(Number(form.inventory)) ||
      Number(form.inventory) < 0
    ) {
      alert("재고를 올바르게 입력해주세요.");
      return;
    }

    setSubmitting(true);
    try {
      const res: RsData<ProductDto> = await apiFetch("/api/Product", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.trim(),
          price: Number(form.price),
          inventory: Number(form.inventory),
          description: form.description.trim(),
        }),
      });
      alert(res.msg);
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      alert("상품 등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          ← 뒤로
        </button>
        <h2 className="text-base font-semibold">상품 추가</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="border border-gray-300 rounded-xl p-6 flex flex-col gap-5"
      >
        {/* Image placeholder */}
        <div className="w-full h-40 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400">
          <span className="text-5xl mb-2">☕</span>
          <span className="text-xs">Image</span>
        </div>

        {/* 상품명 */}
        <div>
          <label className="text-sm text-gray-600 block mb-1.5 font-medium">
            상품명 <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateForm("name", e.target.value)}
            placeholder="2자 이상 입력"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
        </div>

        {/* 가격 / 재고 */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1.5 font-medium">
              가격 (원) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => updateForm("price", e.target.value)}
              min={0}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
          <div className="flex-1">
            <label className="text-sm text-gray-600 block mb-1.5 font-medium">
              재고 (개) <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              value={form.inventory}
              onChange={(e) => updateForm("inventory", e.target.value)}
              min={0}
              placeholder="0"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        {/* 상품 설명 */}
        <div>
          <label className="text-sm text-gray-600 block mb-1.5 font-medium">
            상품 설명
          </label>
          <textarea
            value={form.description}
            onChange={(e) => updateForm("description", e.target.value)}
            placeholder="원두 특징, 향미 등을 입력하세요."
            rows={3}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 rounded-lg py-2.5 text-sm hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "등록중..." : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
