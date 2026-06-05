"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/backend/client";
import type { OrderDto, OrderStatus } from "@/type/order";
import { ORDER_STATUS_LABEL } from "@/type/order";
import type { UserDto } from "@/type/account";

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "border border-gray-400 text-gray-600",
  PROCESSING: "border border-yellow-400 text-yellow-600",
  SHIPPED: "border border-blue-400 text-blue-600",
  DELIVERED: "border border-green-400 text-green-600",
  CANCELLED: "border border-red-300 text-red-500",
};

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [userMap, setUserMap] = useState<Map<number, UserDto>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);

  // 체크박스
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  // 라디오 버튼
  const [targetStatus, setTargetStatus] = useState<OrderStatus | null>(null);
  const [applying, setApplying] = useState(false);

  // 전체 일괄 토글 (기존 기능 유지)
  const [bulkToggling, setBulkToggling] = useState(false);

  const ordersRef = useRef<OrderDto[]>([]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [orderList, userList]: [OrderDto[], UserDto[]] = await Promise.all([
          apiFetch("/api/orders"),
          apiFetch("/api/users"),
        ]);
        setOrders(orderList);
        setUserMap(new Map(userList.map((u) => [u.id, u])));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // 배송 예정일이 지난 PENDING 주문 자동 SHIPPED 처리
  useEffect(() => {
    if (loading) return;

    const autoShip = async () => {
      const today = new Date().toISOString().slice(0, 10);
      const targets = ordersRef.current.filter(
        (o) => o.status === "PENDING" && o.deliveryDate <= today
      );
      if (targets.length === 0) return;

      try {
        await Promise.all(
          targets.map((o) =>
            apiFetch(`/api/orders/${o.id}`, {
              method: "PUT",
              body: JSON.stringify({
                address: o.address,
                addressDetail: o.addressDetail,
                postcode: o.postcode,
                status: "SHIPPED",
              }),
            })
          )
        );
        const targetIds = new Set(targets.map((o) => o.id));
        setOrders((prev) =>
          prev.map((o) => (targetIds.has(o.id) ? { ...o, status: "SHIPPED" } : o))
        );
        setSelectedOrder((prev) =>
          prev && targetIds.has(prev.id) ? { ...prev, status: "SHIPPED" } : prev
        );
      } catch (err) {
        console.error("자동 발송 처리 오류:", err);
      }
    };

    autoShip();
    const interval = setInterval(autoShip, 60000);
    return () => clearInterval(interval);
  }, [loading]);

  const filtered = searchQuery.trim()
    ? orders.filter((o) => {
        const user = userMap.get(o.userId);
        return user?.email.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : orders;

  // 전체선택 여부
  const allChecked =
    filtered.length > 0 && filtered.every((o) => selectedIds.has(o.id));
  const someChecked = filtered.some((o) => selectedIds.has(o.id));

  const toggleAll = () => {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((o) => o.id)));
    }
  };

  const toggleOne = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // 선택된 주문들의 상태를 targetStatus로 일괄 변경
  const handleApplyStatus = async () => {
    if (selectedIds.size === 0 || !targetStatus) return;
    setApplying(true);
    try {
      const targets = orders.filter((o) => selectedIds.has(o.id));
      await Promise.all(
        targets.map((o) =>
          apiFetch(`/api/orders/${o.id}`, {
            method: "PUT",
            body: JSON.stringify({
              address: o.address,
              addressDetail: o.addressDetail,
              postcode: o.postcode,
              status: targetStatus,
            }),
          })
        )
      );
      setOrders((prev) =>
        prev.map((o) => (selectedIds.has(o.id) ? { ...o, status: targetStatus } : o))
      );
      if (selectedOrder && selectedIds.has(selectedOrder.id)) {
        setSelectedOrder((prev) => prev && { ...prev, status: targetStatus });
      }
      setSelectedIds(new Set());
    } catch (err) {
      console.error(err);
      alert("상태 변경 중 오류가 발생했습니다.");
    } finally {
      setApplying(false);
    }
  };

  const updateOrderStatus = async (order: OrderDto, newStatus: OrderStatus) => {
    await apiFetch(`/api/orders/${order.id}`, {
      method: "PUT",
      body: JSON.stringify({
        address: order.address,
        addressDetail: order.addressDetail,
        postcode: order.postcode,
        status: newStatus,
      }),
    });
  };

  const allShipped =
    orders.length > 0 && orders.every((o) => o.status === "SHIPPED");
  const bulkTargetStatus: OrderStatus = allShipped ? "PENDING" : "SHIPPED";

  const handleBulkToggle = async () => {
    if (orders.length === 0) return;
    setBulkToggling(true);
    try {
      await Promise.all(orders.map((o) => updateOrderStatus(o, bulkTargetStatus)));
      setOrders((prev) => prev.map((o) => ({ ...o, status: bulkTargetStatus })));
      setSelectedOrder((prev) => prev && { ...prev, status: bulkTargetStatus });
    } catch (err) {
      console.error(err);
      alert("일괄 변경 중 오류가 발생했습니다.");
    } finally {
      setBulkToggling(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await apiFetch(`/api/orders/${id}`, { method: "DELETE" });
      setOrders((prev) => prev.filter((o) => o.id !== id));
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      if (selectedOrder?.id === id) setSelectedOrder(null);
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
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        {/* Search + 전체 일괄 */}
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="이메일 검색..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
          <button className="border border-gray-300 rounded-lg px-5 py-2 text-sm hover:bg-gray-50 transition-colors">
            검색
          </button>
          <button
            onClick={handleBulkToggle}
            disabled={bulkToggling || orders.length === 0}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap ${
              bulkTargetStatus === "SHIPPED"
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {bulkToggling
              ? "처리중..."
              : bulkTargetStatus === "SHIPPED"
              ? "전체 발송완료"
              : "전체 주문확인중"}
          </button>
        </div>

        {/* Table */}
        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                {/* 전체선택 체크박스 */}
                <th className="py-3 px-3 w-10">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                    onChange={toggleAll}
                    className="cursor-pointer accent-gray-700"
                  />
                </th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 w-10">No.</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500">이메일</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 w-22">등록일</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500">주소</th>
                <th className="text-left py-3 px-2 font-semibold text-gray-500 w-24">배송예정일</th>
                <th className="py-3 px-2 font-semibold text-gray-500 text-center w-28">상태</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-gray-400">로딩중...</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-14 text-gray-400">주문이 없습니다.</td>
                </tr>
              )}
              {filtered.map((order, index) => {
                const user = userMap.get(order.userId);
                const today = new Date().toISOString().slice(0, 10);
                const isOverdue = order.status === "PENDING" && order.deliveryDate <= today;
                const isChecked = selectedIds.has(order.id);

                return (
                  <tr
                    key={order.id}
                    onClick={() =>
                      setSelectedOrder(selectedOrder?.id === order.id ? null : order)
                    }
                    className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
                      isChecked
                        ? "bg-blue-50"
                        : selectedOrder?.id === order.id
                        ? "bg-gray-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {/* 체크박스 */}
                    <td
                      className="py-3 px-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(order.id)}
                        className="cursor-pointer accent-gray-700"
                      />
                    </td>
                    <td className="py-3 px-2 text-gray-500">
                      {String(index + 1).padStart(2, "0")}
                    </td>
                    <td className="py-3 px-2">
                      {user?.email ?? `user #${order.userId}`}
                    </td>
                    <td className="py-3 px-2 text-gray-500">{formatDate(order.createDate)}</td>
                    <td className="py-3 px-2 text-gray-500 max-w-[6rem] truncate">
                      {order.address}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-600"}`}>
                        {order.deliveryDate}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-center gap-1">
                        <span className={`text-xs px-2 py-1 rounded-lg ${STATUS_STYLE[order.status]}`}>
                          {ORDER_STATUS_LABEL[order.status]}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(order.id); }}
                          className="text-xs px-2 py-1 rounded-lg border border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-500"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 선택 카운트 안내 */}
        {someChecked && (
          <p className="text-xs text-gray-400 pl-1">
            {selectedIds.size}개 선택됨 — 우측 패널에서 상태를 선택 후 적용하세요.
          </p>
        )}
      </div>

      {/* Right: 상태 변경 패널 + 주문 상세 */}
      <div className="w-56 flex-shrink-0 flex flex-col gap-3">

        {/* 라디오 버튼 + 적용 */}
        <div className="border border-gray-300 rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-gray-200">
            상태 일괄 변경
          </h3>
          <div className="flex flex-col gap-2 mb-4">
            {ALL_STATUSES.map((status) => (
              <label
                key={status}
                className="flex items-center gap-2 cursor-pointer group"
              >
                <input
                  type="radio"
                  name="targetStatus"
                  value={status}
                  checked={targetStatus === status}
                  onChange={() => setTargetStatus(status)}
                  className="accent-gray-700 cursor-pointer"
                />
                <span
                  className={`text-xs px-2 py-0.5 rounded-lg ${STATUS_STYLE[status]}`}
                >
                  {ORDER_STATUS_LABEL[status]}
                </span>
              </label>
            ))}
          </div>
          <button
            onClick={handleApplyStatus}
            disabled={selectedIds.size === 0 || !targetStatus || applying}
            className="w-full bg-gray-900 text-white rounded-lg py-2 text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {applying
              ? "처리중..."
              : selectedIds.size > 0
              ? `${selectedIds.size}개 적용`
              : "적용"}
          </button>
        </div>

        {/* 주문 상세 */}
        <div
          className={`border border-gray-300 rounded-xl p-4 transition-opacity ${
            selectedOrder ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {selectedOrder && (() => {
            const user = userMap.get(selectedOrder.userId);
            return (
              <>
                <h3 className="font-semibold text-sm mb-4 pb-2 border-b border-gray-200">
                  주문 상세
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">No.</span>
                    <span>{String(selectedOrder.id).padStart(2, "0")}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">이메일</span>
                    <span className="text-right text-xs break-all">{user?.email ?? "-"}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">주소</span>
                    <span className="text-right text-xs">{selectedOrder.address}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">우편번호</span>
                    <span className="text-xs">{selectedOrder.postcode}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">총금액</span>
                    <span className="text-xs font-semibold">
                      {selectedOrder.totalPrice.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500 flex-shrink-0">배송예정일</span>
                    <span className="text-xs">{selectedOrder.deliveryDate}</span>
                  </div>
                  <div className="flex justify-between gap-2 items-center">
                    <span className="text-gray-500 flex-shrink-0">상태</span>
                    <span className={`text-xs px-2 py-1 rounded-lg ${STATUS_STYLE[selectedOrder.status]}`}>
                      {ORDER_STATUS_LABEL[selectedOrder.status]}
                    </span>
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
