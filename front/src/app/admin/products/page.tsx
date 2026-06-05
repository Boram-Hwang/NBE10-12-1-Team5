"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/backend/client";
import type { ItemDto } from "@/type/product";
import type { RsData } from "@/type/rsData";

type FormState = {
  name: string;
  price: string;
  inventory: string;
  description: string;
};

const PAGE_SIZE = 10;

export default function ProductsPage() {
  const [items, setItems] = useState<ItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemDto | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    price: "",
    inventory: "",
    description: "",
  });
  const [page, setPage] = useState(1);

  const fetchItems = async () => {
    try {
      const data: ItemDto[] = await apiFetch("/api/items");
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const filtered = searchQuery.trim()
    ? items.filter((i) =>
        i.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = () => setPage(1);

  const updateForm = (key: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleRowClick = (item: ItemDto) => {
    setSelectedItem(item);
    setForm({
      name: item.name,
      price: String(item.price),
      inventory: String(item.inventory),
      description: item.description ?? "",
    });
  };

  const validateForm = () => {
    if (!form.name.trim() || form.name.length < 2) {
      alert("상품명은 2자 이상 입력해주세요.");
      return false;
    }
    if (!form.price || isNaN(Number(form.price))) {
      alert("가격을 올바르게 입력해주세요.");
      return false;
    }
    if (!form.inventory || isNaN(Number(form.inventory))) {
      alert("재고를 올바르게 입력해주세요.");
      return false;
    }
    return true;
  };

  const handleUpdate = async () => {
    if (!selectedItem || !validateForm()) return;
    try {
      const res: RsData<void> = await apiFetch(`/api/items/${selectedItem.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: form.name,
          price: Number(form.price),
          inventory: Number(form.inventory),
          description: form.description,
        }),
      });
      setItems((prev) =>
        prev.map((i) =>
          i.id === selectedItem.id
            ? {
                ...i,
                name: form.name,
                price: Number(form.price),
                inventory: Number(form.inventory),
                description: form.description,
              }
            : i
        )
      );
      setSelectedItem((prev) =>
        prev ? { ...prev, name: form.name, price: Number(form.price), inventory: Number(form.inventory), description: form.description } : prev
      );
      alert(res.msg);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;
    if (!confirm(`"${selectedItem.name}"을(를) 삭제하시겠습니까?`)) return;
    try {
      const res: RsData<void> = await apiFetch(
        `/api/items/${selectedItem.id}`,
        { method: "DELETE" }
      );
      setItems((prev) => prev.filter((i) => i.id !== selectedItem.id));
      setSelectedItem(null);
      setForm({ name: "", price: "", inventory: "", description: "" });
      alert(res.msg);
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString("ko-KR") : "-";

  return (
    <div className="flex gap-4 h-full">
      {/* Left: Table */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">
        {/* Search */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              handleSearch();
            }}
            placeholder="상품명 검색..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
          <button
            onClick={handleSearch}
            className="border border-gray-300 rounded-lg px-5 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            검색
          </button>
        </div>

        {/* Table */}
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4 font-semibold text-gray-500 w-12">No.</th>
                <th className="py-3 px-2 w-10" />
                <th className="text-left py-3 px-2 font-semibold text-gray-500">상품명</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 w-20">가격</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 w-16">재고</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 w-24">등록일</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-gray-400">
                    로딩중...
                  </td>
                </tr>
              )}
              {!loading && paged.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-14 text-gray-400">
                    상품이 없습니다.
                  </td>
                </tr>
              )}
              {paged.map((item, index) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item)}
                  className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
                    selectedItem?.id === item.id
                      ? "bg-amber-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <td className="py-3 px-4 text-gray-500">
                    {String((page - 1) * PAGE_SIZE + index + 1).padStart(2, "0")}
                  </td>
                  <td className="py-2 px-2">
                    <div className="w-8 h-8 rounded-lg overflow-hidden">
                      <Image src="/coffee_bean.jpg" alt={item.name} width={32} height={32} className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="py-3 px-2 font-medium">{item.name}</td>
                  <td className="py-3 px-2 text-gray-500">
                    {item.price.toLocaleString()}원
                  </td>
                  <td className="py-3 px-2 text-gray-500">{item.inventory}개</td>
                  <td className="py-3 px-2 text-gray-500">
                    {formatDate(item.createDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination + 추가 버튼 */}
        <div className="flex items-center justify-between">
          <Link
            href="/admin/products/new"
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
          >
            + 상품 추가
          </Link>
          {!loading && totalPages > 1 && (
            <div className="flex items-center gap-1">
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
        </div>
      </div>

      {/* Right: Product Detail / Edit Form */}
      <div className="w-64 border border-gray-300 rounded-xl p-5 flex-shrink-0 flex flex-col">
        <h3 className="font-semibold text-sm mb-4 pb-2 border-b border-gray-200">
          상품 정보
        </h3>

        {!selectedItem ? (
          <p className="text-xs text-gray-400 text-center mt-8">
            목록에서 상품을 선택하세요.
          </p>
        ) : (
          <>
            {/* Image */}
            <div className="w-full aspect-square rounded-xl overflow-hidden mb-4">
              <Image src="/coffee_bean.jpg" alt={selectedItem?.name ?? "상품"} width={200} height={200} className="w-full h-full object-cover" />
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <label className="text-xs text-gray-500 block mb-1">상품명</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400"
                />
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">가격 (원)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateForm("price", e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400"
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 block mb-1">재고 (개)</label>
                  <input
                    type="number"
                    value={form.inventory}
                    onChange={(e) => updateForm("inventory", e.target.value)}
                    className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">상품 설명</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  rows={3}
                  className="w-full border border-gray-300 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-gray-400 resize-none"
                />
              </div>
            </div>

            {/* 수정 / 삭제 버튼 */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleUpdate}
                className="flex-1 border border-gray-300 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                수정
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
              >
                삭제
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
