import { Outlet } from "react-router-dom";
import { Search, Bell } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <header className="h-16 border-b border-black/[0.06] bg-white/80 backdrop-blur sticky top-0 z-10 flex items-center justify-between px-6">
          <div className="relative w-80 max-w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search vendors, batteries, leads..."
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-transparent text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30"
            />
          </div>
          <button className="w-9 h-9 rounded-lg hover:bg-surface flex items-center justify-center text-muted">
            <Bell size={18} />
          </button>
        </header>
        <main className="p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
