"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "계정 관리", href: "/admin/accounts" },
  { label: "주문 관리", href: "/admin/orders" },
  { label: "상품 관리", href: "/admin/products" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="border border-gray-300 rounded-2xl min-h-[calc(100vh-2rem)] flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <header className="text-center py-5 border-b border-gray-100">
          <Link href="/" className="text-2xl font-bold tracking-tight hover:opacity-70 transition-opacity">!Five Guys Coffee</Link>
        </header>

        {/* Body */}
        <div className="flex flex-1">
          {/* Left Sidebar */}
          <aside className="w-44 border-r border-gray-100 p-4 flex flex-col gap-3 flex-shrink-0">
            {/* Admin Profile */}
            <div className="flex flex-col items-center gap-1.5 py-4 border-b border-gray-100">
              <div className="w-14 h-14 border-2 border-gray-300 rounded-full flex items-center justify-center text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-8 h-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                  />
                </svg>
              </div>
              <p className="text-xs text-gray-400 text-center break-all">
                admin@coffee.com
              </p>
              <p className="text-xs font-semibold text-gray-600">관리자</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 pt-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`py-2 px-3 rounded-lg text-sm font-medium text-center border transition-colors ${
                    pathname === item.href
                      ? "bg-gray-100 border-gray-300 text-gray-900"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 p-6 min-w-0">{children}</main>
        </div>

        {/* Footer */}
        <footer className="text-center py-3 border-t border-gray-100 text-gray-400 text-xs">
          ⓒ 2026 !Five_Guys All rights reserved.
        </footer>
      </div>
    </div>
  );
}
