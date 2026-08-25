import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Building2, Users2, Ticket, Package,
  BatteryCharging, Bike, KanbanSquare, FileText, LogOut, Zap, UserCog,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const nav = [
  { to: "/crm", label: "Dashboard", icon: LayoutDashboard, roles: ["ADMIN", "SALES"] },
  { to: "/crm/vendors", label: "Vendors", icon: Building2, roles: ["ADMIN", "SALES"] },
  { to: "/crm/leads", label: "Sales Pipeline", icon: KanbanSquare, roles: ["ADMIN", "SALES"] },
  { to: "/crm/sales-team", label: "Sales Team", icon: UserCog, roles: ["ADMIN"] }, // Sirf Admin dekhega
  { to: "/crm/customers", label: "Customers", icon: Users2, roles: ["ADMIN", "SALES"] },
  { to: "/crm/coupons", label: "Coupons", icon: Ticket, roles: ["ADMIN", "SALES"] },
  { to: "/crm/products", label: "Products", icon: Package, roles: ["ADMIN", "SALES"] },
  { to: "/crm/batteries", label: "Batteries", icon: BatteryCharging, roles: ["ADMIN", "SALES"] },
  { to: "/crm/scooters", label: "Scooters", icon: Bike, roles: ["ADMIN", "SALES"] },
  { to: "/crm/quotations", label: "Quotations", icon: FileText, roles: ["ADMIN", "SALES"] },
];

export default function Sidebar() {
  const { logout, user } = useAuth();

  // Role filtering logic
  const filteredNav = nav.filter(
    (item) => !item.roles || item.roles.includes(user?.role || "ADMIN")
  );

  return (
    <aside className="w-64 shrink-0 bg-ink text-white/90 flex flex-col h-screen sticky top-0">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-ink-border">
        <div className="w-8 h-8 rounded-lg bg-volt flex items-center justify-center">
          <Zap size={18} className="text-ink" strokeWidth={2.5} />
        </div>
        <div>
          <p className="font-display font-semibold text-sm tracking-wide leading-none">VOLTRA CRM</p>
          <p className="text-[10px] text-muted tracking-wider uppercase mt-1">EV Fleet & Vendor OS</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin py-4 px-3 space-y-1">
        {filteredNav.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/crm"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald/15 text-volt"
                  : "text-white/60 hover:bg-white/5 hover:text-white/90"
              }`
            }
          >
            <Icon size={17} strokeWidth={2} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-ink-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-emerald/20 text-volt flex items-center justify-center text-xs font-semibold font-mono">
            {(user?.username || "A").slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.username || "User"}</p>
            <p className="text-[11px] text-muted capitalize">{user?.role || "Signed in"}</p>
          </div>
          <button onClick={logout} className="text-muted hover:text-coral transition-colors" title="Logout">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}