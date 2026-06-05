"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/backend/client";
import type { UserDto } from "@/type/account";

type EditForm = {
  email: string;
  name: string;
};

export default function AccountsPage() {
  const [users, setUsers] = useState<UserDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditForm>({ email: "", name: "" });

  const fetchUsers = async () => {
    try {
      const data: UserDto[] = await apiFetch("/api/users");
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = searchQuery.trim()
    ? users.filter(
        (u) =>
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : users;

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await apiFetch(`/api/users/${id}`, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const startEdit = (user: UserDto) => {
    setEditingId(user.id);
    setEditForm({ email: user.email, name: user.name });
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (id: number) => {
    if (!editForm.email.trim() || !editForm.name.trim()) {
      alert("이메일과 이름을 모두 입력해주세요.");
      return;
    }
    try {
      await apiFetch(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          email: editForm.email,
          name: editForm.name,
        }),
      });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === id
            ? { ...u, email: editForm.email, name: editForm.name }
            : u
        )
      );
      setEditingId(null);
    } catch (err) {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    }
  };

  const formatDate = (dateStr: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString("ko-KR") : "-";

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="이름 또는 이메일 검색..."
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
        />
        <button className="border border-gray-300 rounded-lg px-5 py-2 text-sm hover:bg-gray-50 transition-colors">
          검색
        </button>
      </div>

      {/* Table */}
      <div className="border border-gray-300 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left py-3 px-4 font-semibold text-gray-500 w-12">No.</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500">이름</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500">이메일</th>
              <th className="text-left py-3 px-4 font-semibold text-gray-500 w-24">등록일</th>
              <th className="py-3 px-4 w-28" />
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="text-center py-14 text-gray-400">
                  로딩중...
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-14 text-gray-400">
                  계정이 없습니다.
                </td>
              </tr>
            )}
            {filtered.map((user, index) =>
              editingId === user.id ? (
                <tr key={user.id} className="border-b border-gray-100 bg-blue-50">
                  <td className="py-2 px-4 text-gray-500">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="py-2 px-4">
                    <input
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, name: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, email: e.target.value }))
                      }
                      className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                    />
                  </td>
                  <td className="py-2 px-4 text-gray-500">
                    {formatDate(user.createDate)}
                  </td>
                  <td className="py-2 px-4">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleUpdate(user.id)}
                        className="border border-blue-400 text-blue-600 rounded-lg px-3 py-1 text-xs hover:bg-blue-50"
                      >
                        저장
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-xs hover:bg-gray-100"
                      >
                        취소
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr
                  key={user.id}
                  className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-500">
                    {String(index + 1).padStart(2, "0")}
                  </td>
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4 text-gray-500">{user.email}</td>
                  <td className="py-3 px-4 text-gray-500">
                    {formatDate(user.createDate)}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => startEdit(user)}
                        className="border border-gray-300 rounded-lg px-3 py-1 text-xs hover:bg-gray-100 transition-colors"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="border border-gray-200 rounded-lg px-3 py-1 text-xs hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition-colors"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
