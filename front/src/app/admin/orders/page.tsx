"use client";

import { useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/backend/client";
import type { OrderProductDto, OrderDto, OrderStatus } from "@/type/order";
import { ORDER_STATUS_LABEL } from "@/type/order";
import type { UserDto } from "@/type/account";
import type { ProductDto } from "@/type/product";
import type { RsData } from "@/type/rsData";

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "border border-gray-400 text-gray-600",
  PROCESSING: "border border-yellow-400 text-yellow-600",
  SHIPPED: "border border-blue-400 text-blue-600",
  DELIVERED: "border border-green-400 text-green-600",
  CANCELED: "border border-red-300 text-red-500",
};

// 그룹 타입: 같은 (userId, address, addressDetail, deliveryDate, status) 묶음
type OrderGroup = {
  key: string;
  orders: OrderDto[];
  userId: number;
  address: string;
  addressDetail: string;
  deliveryDate: string;
  status: OrderStatus;
  totalPrice: number;
};

// orders → groups (상태까지 같아야 병합)
function groupOrders(orders: OrderDto[]): OrderGroup[] {
  const map = new Map<string, OrderGroup>();
  for (const o of orders) {
    const key = `${o.userId}|${o.address}|${o.addressDetail}|${o.deliveryDate}|${o.status}`;
    if (map.has(key)) {
      const g = map.get(key)!;
      g.orders.push(o);
      g.totalPrice += o.totalPrice;
    } else {
      map.set(key, {
        key,
        orders: [o],
        userId: o.userId,
        address: o.address,
        addressDetail: o.addressDetail,
        deliveryDate: o.deliveryDate,
        status: o.status,
        totalPrice: o.totalPrice,
      });
    }
  }
  return Array.from(map.values());
}

// 여러 주문의 품목을 같은 productId 기준으로 합산
function combineItems(itemLists: OrderProductDto[][]): OrderProductDto[] {
  const map = new Map<number, OrderProductDto>();
  for (const list of itemLists) {
    for (const it of list) {
      if (map.has(it.productId)) {
        const prev = map.get(it.productId)!;
        map.set(it.productId, { ...prev, productQuantity: prev.productQuantity + it.productQuantity });
      } else {
        map.set(it.productId, { ...it });
      }
    }
  }
  return Array.from(map.values());
}

type EditProduct = { productId: number; productName: string; productQuantity: number };

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [userMap, setUserMap] = useState<Map<number, UserDto>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // 선택된 그룹
  const [selectedGroup, setSelectedGroup] = useState<OrderGroup | null>(null);
  const [selectedGroupItems, setSelectedGroupItems] = useState<OrderProductDto[]>([]);
  const [itemsLoading, setItemsLoading] = useState(false);

  // 수정 모달 (단일 주문)
  const [editingOrder, setEditingOrder] = useState<OrderDto | null>(null);
  const [editProducts, setEditProducts] = useState<EditProduct[]>([]);
  const [allProducts, setAllProducts] = useState<ProductDto[]>([]);
  const [addProductId, setAddProductId] = useState<number | "">("");
  const [addQty, setAddQty] = useState(1);
  const [editSaving, setEditSaving] = useState(false);

  const ordersRef = useRef<OrderDto[]>([]);
  useEffect(() => { ordersRef.current = orders; }, [orders]);

  const fetchAll = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [orderList, userList]: [OrderDto[], UserDto[]] = await Promise.all([
        apiFetch("/api/order"),
        apiFetch("/api/user"),
      ]);
      setOrders(orderList);
      setUserMap(new Map(userList.map((u) => [u.id, u])));
    } catch (err) {
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // 데이터 로드
  useEffect(() => {
    fetchAll(true);
  }, []);

  // 실시간 주문 동기화 이벤트 수신
  useEffect(() => {
    const handleRefresh = () => {
      fetchAll(false);
    };
    window.addEventListener("refresh-orders", handleRefresh);
    return () => {
      window.removeEventListener("refresh-orders", handleRefresh);
    };
  }, []);

  // deliveryDate 14:00 이후 PENDING·PROCESSING → SHIPPED 자동 처리
  useEffect(() => {
    if (loading) return;
    const autoShip = async () => {
      const now = new Date();
      const targets = ordersRef.current.filter((o) => {
        if (o.status !== "PENDING" && o.status !== "PROCESSING") return false;
        if (!o.deliveryDate) return false;
        return now >= new Date(o.deliveryDate.replace(/-/g, "/") + " 14:00:00");
      });
      if (targets.length === 0) return;
      try {
        await Promise.all(
          targets.map((o) =>
            apiFetch(`/api/order/${o.id}`, {
              method: "PUT",
              body: JSON.stringify({ status: "SHIPPED" }),
            })
          )
        );
        const ids = new Set(targets.map((o) => o.id));
        setOrders((prev) => prev.map((o) => (ids.has(o.id) ? { ...o, status: "SHIPPED" } : o)));
      } catch (err) {
        console.error("자동 발송 처리 오류:", err);
      }
    };
    autoShip();
    const interval = setInterval(autoShip, 60000);
    return () => clearInterval(interval);
  }, [loading]);

  // 그룹핑 (orders 변경 시 자동 재계산)
  const grouped = groupOrders(orders);

  // 검색 필터
  const filtered = searchQuery.trim()
    ? grouped.filter((g) => {
        const user = userMap.get(g.userId);
        return user?.email.toLowerCase().includes(searchQuery.toLowerCase());
      })
    : grouped;

  // 주문처리 현황 (개별 주문 기준)
  const statusCounts = orders.reduce<Record<OrderStatus, number>>(
    (acc, o) => { acc[o.status] = (acc[o.status] ?? 0) + 1; return acc; },
    { PENDING: 0, PROCESSING: 0, SHIPPED: 0, DELIVERED: 0, CANCELED: 0 }
  );

  // 그룹 클릭 → 품목 조회 (그룹 내 모든 주문 품목 합산)
  const handleSelectGroup = async (group: OrderGroup) => {
    if (selectedGroup?.key === group.key) {
      setSelectedGroup(null);
      setSelectedGroupItems([]);
      return;
    }
    setSelectedGroup(group);
    setSelectedGroupItems([]);
    setItemsLoading(true);
    try {
      const itemLists = await Promise.all(
        group.orders.map((o) =>
          apiFetch(`/api/order/${o.id}/product`)
            .then((res: RsData<OrderProductDto[]>) => res.data ?? [])
        )
      );
      setSelectedGroupItems(combineItems(itemLists));
    } catch {
      setSelectedGroupItems([]);
    } finally {
      setItemsLoading(false);
    }
  };

  // 그룹 내 모든 주문에 상태 변경 적용 후 orders 갱신
  const applyStatusToGroup = async (group: OrderGroup, status: OrderStatus) => {
    await Promise.all(
      group.orders.map((o) =>
        apiFetch(`/api/order/${o.id}`, {
          method: "PUT",
          body: JSON.stringify({ status }),
        })
      )
    );
    const ids = new Set(group.orders.map((o) => o.id));
    setOrders((prev) => prev.map((o) => (ids.has(o.id) ? { ...o, status } : o)));
    setSelectedGroup(null);
    setSelectedGroupItems([]);
  };

  const handleProcess = async (group: OrderGroup) => {
    try { await applyStatusToGroup(group, "PROCESSING"); }
    catch { alert("주문 처리 중 오류가 발생했습니다."); }
  };

  const handleDeliver = async (group: OrderGroup) => {
    try { await applyStatusToGroup(group, "DELIVERED"); }
    catch { alert("배송완료 처리 중 오류가 발생했습니다."); }
  };

  const handleCancel = async (group: OrderGroup) => {
    const count = group.orders.length;
    if (!confirm(`${count}건의 주문을 취소하시겠습니까?`)) return;
    try { await applyStatusToGroup(group, "CANCELED"); }
    catch { alert("취소 중 오류가 발생했습니다."); }
  };

  // 개별 주문 단건 취소
  const handleSingleCancel = async (orderId: number) => {
    if (!confirm(`주문 #${orderId} 단건을 취소할까?`)) return;
    try {
      await apiFetch(`/api/order/${orderId}`, {
        method: "PUT",
        body: JSON.stringify({ status: "CANCELED" }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELED" } : o))
      );
      setSelectedGroup(null);
      setSelectedGroupItems([]);
    } catch {
      alert("개별 취소 중 오류가 발생했어!");
    }
  };

  const handleDelete = async (group: OrderGroup) => {
    const count = group.orders.length;
    if (!confirm(`${count}건의 주문을 삭제하시겠습니까?`)) return;
    try {
      await Promise.all(
        group.orders.map((o) => apiFetch(`/api/order/${o.id}`, { method: "DELETE" }))
      );
      const ids = new Set(group.orders.map((o) => o.id));
      setOrders((prev) => prev.filter((o) => !ids.has(o.id)));
      if (selectedGroup?.key === group.key) {
        setSelectedGroup(null);
        setSelectedGroupItems([]);
      }
    } catch {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 수정 모달 (단일 주문 그룹만)
  const openEdit = async (order: OrderDto) => {
    setEditingOrder(order);
    setEditProducts([]);
    setAddProductId("");
    setAddQty(1);
    try {
      const [itemsRes, allRes]: [RsData<OrderProductDto[]>, ProductDto[]] = await Promise.all([
        apiFetch(`/api/order/${order.id}/product`),
        apiFetch("/api/Product"),
      ]);
      setEditProducts((itemsRes.data ?? []).map((d) => ({
        productId: d.productId, productName: d.productName, productQuantity: d.productQuantity,
      })));
      setAllProducts(allRes);
    } catch {
      alert("주문 품목 조회 중 오류가 발생했습니다.");
      setEditingOrder(null);
    }
  };

  const closeEdit = () => setEditingOrder(null);

  const handleEditQty = (productId: number, qty: number) =>
    setEditProducts((prev) => prev.map((it) => (it.productId === productId ? { ...it, productQuantity: Math.max(1, qty) } : it)));

  const handleEditRemove = (productId: number) =>
    setEditProducts((prev) => prev.filter((it) => it.productId !== productId));

  const handleAddItem = () => {
    if (!addProductId) return;
    const product = allProducts.find((i) => i.id === Number(addProductId));
    if (!product) return;
    const existing = editProducts.find((it) => it.productId === product.id);
    if (existing) {
      setEditProducts((prev) => prev.map((it) =>
        it.productId === product.id ? { ...it, productQuantity: it.productQuantity + addQty } : it
      ));
    } else {
      setEditProducts((prev) => [...prev, { productId: product.id, productName: product.name, productQuantity: addQty }]);
    }
    setAddProductId("");
    setAddQty(1);
  };

  const handleEditSave = async () => {
    if (!editingOrder || editProducts.length === 0) {
      alert("최소 1개 이상의 품목이 필요합니다.");
      return;
    }
    setEditSaving(true);
    try {
      await apiFetch(`/api/order/${editingOrder.id}/product`, {
        method: "PUT",
        body: JSON.stringify(editProducts.map((it) => ({ productId: it.productId, productQuantity: it.productQuantity }))),
      });
      await fetchAll(false);
      if (selectedGroup) {
        const itemLists = await Promise.all(
          selectedGroup.orders.map((o) =>
            apiFetch(`/api/order/${o.id}/product`)
              .then((res: RsData<OrderProductDto[]>) => res.data ?? [])
          )
        );
        setSelectedGroupItems(combineItems(itemLists));
      }
      closeEdit();
    } catch {
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setEditSaving(false);
    }
  };

  const canAct = (status: OrderStatus) => status === "PENDING" || status === "PROCESSING";

  return (
    <div className="flex gap-4 h-full">
      {/* Left: Table */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
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
        </div>

        <div className="border border-gray-300 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-3 font-semibold text-gray-500 w-10">No.</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-500">이메일</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-500">주소</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-500 w-24">배송예정일</th>
                <th className="text-left py-3 px-3 font-semibold text-gray-500 w-20">총금액</th>
                <th className="py-3 px-3 font-semibold text-gray-500 text-center w-28">상태</th>
                <th className="py-3 px-3 font-semibold text-gray-500 text-center w-44">작업</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={7} className="text-center py-14 text-gray-400">로딩중...</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-14 text-gray-400">주문이 없습니다.</td></tr>
              )}
              {filtered.map((group, index) => {
                const user = userMap.get(group.userId);
                const now = new Date();
                const isOverdue = canAct(group.status) && !!group.deliveryDate &&
                  now >= new Date(`${group.deliveryDate}T14:00:00`);
                const isSelected = selectedGroup?.key === group.key;
                const isSingle = group.orders.length === 1;

                return (
                  <tr
                    key={group.key}
                    onClick={() => handleSelectGroup(group)}
                    className={`border-b border-gray-100 last:border-0 cursor-pointer transition-colors ${
                      isSelected ? "bg-gray-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="py-3 px-3 text-gray-500">
                      {String(index + 1).padStart(2, "0")}
                      {group.orders.length > 1 && (
                        <span className="ml-1 text-xs text-blue-400">×{group.orders.length}</span>
                      )}
                    </td>
                    <td className="py-3 px-3">{user?.email ?? `user #${group.userId}`}</td>
                    <td className="py-3 px-3 text-gray-500 max-w-[7rem] truncate">{group.address}</td>
                    <td className="py-3 px-3">
                      <span className={`text-xs ${isOverdue ? "text-red-500 font-medium" : "text-gray-600"}`}>
                        {group.deliveryDate}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-700 text-xs font-medium">
                      {group.totalPrice.toLocaleString()}원
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span className={`text-xs px-2 py-1 rounded-lg ${STATUS_STYLE[group.status]}`}>
                        {ORDER_STATUS_LABEL[group.status]}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center justify-center gap-1 flex-wrap">
                        {group.status === "PENDING" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleProcess(group); }}
                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
                          >
                            주문 처리
                          </button>
                        )}
                        {group.status === "PENDING" && isSingle && (
                          <button
                            onClick={(e) => { e.stopPropagation(); openEdit(group.orders[0]); }}
                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                          >
                            수정
                          </button>
                        )}
                        {group.status === "PENDING" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleCancel(group); }}
                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            취소
                          </button>
                        )}
                        {group.status === "CANCELED" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(group); }}
                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-red-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            삭제
                          </button>
                        )}
                        {group.status === "SHIPPED" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeliver(group); }}
                            className="text-xs px-2 py-1 rounded-lg border border-gray-200 text-gray-400 hover:border-green-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          >
                            배송완료
                          </button>
                        )}
                        {group.status === "DELIVERED" && (
                          <span className="text-xs text-gray-300">-</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: 주문처리 현황 + 그룹 상세 */}
      <div className="w-52 flex-shrink-0 flex flex-col gap-3">
        {/* 주문처리 현황 */}
        <div className="border border-gray-300 rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-gray-200">주문처리 현황</h3>
          <div className="flex flex-col gap-2">
            {(Object.keys(ORDER_STATUS_LABEL) as OrderStatus[]).map((status) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-lg ${STATUS_STYLE[status]}`}>
                  {ORDER_STATUS_LABEL[status]}
                </span>
                <span className="text-sm font-semibold text-gray-700">{statusCounts[status]}건</span>
              </div>
            ))}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-1">
              <span className="text-xs text-gray-500">전체</span>
              <span className="text-sm font-bold text-gray-900">{orders.length}건</span>
            </div>
          </div>
        </div>

        {/* 그룹 상세 */}
        <div className={`border border-gray-300 rounded-xl p-4 transition-opacity ${
          selectedGroup ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}>
          {selectedGroup && (() => {
            const user = userMap.get(selectedGroup.userId);
            return (
              <>
                <h3 className="font-semibold text-sm mb-3 pb-2 border-b border-gray-200">
                  주문 상세
                  {selectedGroup.orders.length > 1 && (
                    <span className="ml-1 text-xs text-blue-400 font-normal">
                      ({selectedGroup.orders.length}건 합산)
                    </span>
                  )}
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-gray-500">주문번호</span>
                    <span className="text-right break-all">
                      {selectedGroup.orders.map((o) => `#${o.id}`).join(", ")}
                    </span>
                  </div>
                  {[
                    ["이메일", user?.email ?? "-"],
                    ["주소", selectedGroup.address],
                    ["우편번호", selectedGroup.orders[0]?.postcode ?? "-"],
                    ["배송예정일", selectedGroup.deliveryDate],
                    ["합계금액", `${selectedGroup.totalPrice.toLocaleString()}원`],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-2">
                      <span className="text-gray-500 flex-shrink-0">{label}</span>
                      <span className="text-right break-all">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between gap-2 items-center pt-1">
                    <span className="text-gray-500">상태</span>
                    <span className={`text-xs px-2 py-0.5 rounded-lg ${STATUS_STYLE[selectedGroup.status]}`}>
                      {ORDER_STATUS_LABEL[selectedGroup.status]}
                    </span>
                  </div>
                </div>

                {/* 개별 주문 관리 (PENDING 상태일 때만 표시) */}
                {selectedGroup.status === "PENDING" && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <h4 className="text-xs font-semibold text-gray-500 mb-2">개별 주문 관리</h4>
                    <div className="flex flex-col gap-1.5">
                      {selectedGroup.orders.map((o) => (
                        <div key={o.id} className="flex items-center justify-between text-xs bg-gray-50 px-2 py-1.5 rounded-lg border border-gray-100">
                          <span className="font-medium text-gray-700">
                            #{o.id} <span className="text-gray-400 font-normal">({o.totalPrice.toLocaleString()}원)</span>
                          </span>
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => { e.stopPropagation(); openEdit(o); }}
                              className="px-2 py-1 bg-white border border-gray-200 rounded text-gray-600 hover:border-gray-400 hover:bg-gray-100 transition-colors"
                            >
                              수정
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSingleCancel(o.id); }}
                              className="px-2 py-1 bg-white border border-red-200 rounded text-red-500 hover:border-red-300 hover:bg-red-50 transition-colors"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 합산 품목 */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h4 className="text-xs font-semibold text-gray-500 mb-2">주문 품목</h4>
                  {itemsLoading ? (
                    <p className="text-xs text-gray-400 text-center py-2">로딩중...</p>
                  ) : selectedGroupItems.length === 0 ? (
                    <p className="text-xs text-gray-400 text-center py-2">품목 없음</p>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      {selectedGroupItems.map((it) => (
                        <div key={it.productId} className="flex items-center justify-between text-xs gap-1">
                          <span className="text-gray-700 truncate flex-1">{it.productName}</span>
                          <span className="text-gray-400 flex-shrink-0">×{it.productQuantity}</span>
                          <span className="text-gray-600 flex-shrink-0 font-medium">
                            {(it.productPrice * it.productQuantity).toLocaleString()}원
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* 수정 모달 */}
      {editingOrder && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base font-bold mb-4 pb-3 border-b border-gray-200">
              주문 #{editingOrder.id} 품목 수정
            </h2>
            <div className="space-y-2 mb-4 max-h-52 overflow-y-auto">
              {editProducts.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">품목이 없습니다.</p>
              )}
              {editProducts.map((it) => (
                <div key={it.productId} className="flex items-center gap-2">
                  <span className="flex-1 text-sm truncate">{it.productName}</span>
                  <input
                    type="number" min={1} value={it.productQuantity}
                    onChange={(e) => handleEditQty(it.productId, Number(e.target.value))}
                    className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-center focus:outline-none"
                  />
                  <span className="text-xs text-gray-400">개</span>
                  <button onClick={() => handleEditRemove(it.productId)} className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mb-5 pt-3 border-t border-gray-100">
              <select
                value={addProductId}
                onChange={(e) => setAddProductId(e.target.value === "" ? "" : Number(e.target.value))}
                className="flex-1 border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none"
              >
                <option value="">상품 선택</option>
                {allProducts.map((prod) => (
                  <option key={prod.id} value={prod.id}>{prod.name} ({prod.price.toLocaleString()}원)</option>
                ))}
              </select>
              <input
                type="number" min={1} value={addQty}
                onChange={(e) => setAddQty(Math.max(1, Number(e.target.value)))}
                className="w-16 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none"
              />
              <button onClick={handleAddItem} disabled={!addProductId}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-40">
                추가
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={closeEdit} className="flex-1 border border-gray-300 rounded-xl py-2.5 text-sm hover:bg-gray-50">취소</button>
              <button onClick={handleEditSave} disabled={editSaving}
                className="flex-1 bg-gray-900 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50">
                {editSaving ? "저장중..." : "저장"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
