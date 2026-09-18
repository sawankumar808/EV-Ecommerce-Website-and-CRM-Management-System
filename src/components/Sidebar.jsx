import {
  NavLink,
} from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Users2,
  Ticket,
  Package,
  BatteryCharging,
  Bike,
  KanbanSquare,
  FileText,
  LogOut,
  Zap,
  UserCog,
  BarChart3,
  Image,
  ShoppingBag,
  ShieldCheck,
} from "lucide-react";

import {
  useAuth,
} from "../context/AuthContext";


const nav = [

  {
    to: "/crm",
    label: "Dashboard",
    icon: LayoutDashboard,
    resource: "dashboard",
  },

  {
    to: "/crm/vendors",
    label: "Vendors",
    icon: Building2,
    resource: "vendors",
  },

  {
    to: "/crm/leads",
    label: "Sales Pipeline",
    icon: KanbanSquare,
    resource: "leads",
  },

  {
    to: "/crm/sales",
    label: "Sales / Orders",
    icon: ShoppingBag,
    resource: "sales",
  },

  {
    to: "/crm/sales-team",
    label: "Sales Team",
    icon: UserCog,
    resource: "sales_team",
    adminOnly: true,
  },

  {
    to: "/crm/customers",
    label: "Customers",
    icon: Users2,
    resource: "customers",
  },

  {
    to: "/crm/coupons",
    label: "Coupons",
    icon: Ticket,
    resource: "coupons",
  },

  {
    to: "/crm/products",
    label: "Products",
    icon: Package,
    resource: "products",
  },

  {
    to: "/crm/batteries",
    label: "Batteries",
    icon: BatteryCharging,
    resource: "batteries",
  },

  {
    to: "/crm/scooters",
    label: "Scooters",
    icon: Bike,
    resource: "scooters",
  },

  {
    to: "/crm/quotations",
    label: "Quotations",
    icon: FileText,
    resource: "quotations",
  },

  {
    to: "/crm/reports",
    label: "Reports",
    icon: BarChart3,
    resource: "reports",
    adminOnly: true,
  },

  {
    to: "/crm/settings",
    label: "Site Banners",
    icon: Image,
    resource: "settings",
    adminOnly: true,
  },

  {
    to: "/crm/roles",
    label: "Role Management",
    icon: ShieldCheck,
    resource: "users",
    adminOnly: true,
  },
];


export default function Sidebar() {

  const {
    logout,
    user,
    can,
  } = useAuth();


  const filteredNav =
    nav.filter(
      (item) => {

        if (
          item.adminOnly
        ) {
          return (
            user?.role ===
            "ADMIN"
          );
        }

        return can(
          item.resource,
          "view"
        );
      }
    );


  return (
    <aside className="w-64 shrink-0 bg-ink text-white/90 flex flex-col h-screen sticky top-0">

      <div className="flex items-center gap-2 px-5 h-16 border-b border-ink-border">

        <div className="w-8 h-8 rounded-lg bg-volt flex items-center justify-center">

          <Zap
            size={18}
            className="text-ink"
          />

        </div>

        <div>

          <p className="font-display font-semibold text-sm tracking-wide leading-none">
            VOLTRA CRM
          </p>

          <p className="text-[10px] text-muted tracking-wider uppercase mt-1">
            EV Fleet & Vendor OS
          </p>

        </div>

      </div>


      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">

        {filteredNav.map(
          ({
            to,
            label,
            icon: Icon,
          }) => (

            <NavLink
              key={to}
              to={to}
              end={
                to === "/crm"
              }
              className={({
                isActive,
              }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-emerald/15 text-volt"
                    : "text-white/60 hover:bg-white/5 hover:text-white/90"
                }`
              }
            >

              <Icon
                size={17}
                strokeWidth={2}
              />

              {label}

            </NavLink>

          )
        )}

      </nav>


      <div className="p-3 border-t border-ink-border">

        <div className="flex items-center gap-2 px-2 py-2">

          <div className="w-8 h-8 rounded-full bg-emerald/20 text-volt flex items-center justify-center text-xs font-semibold font-mono">

            {(
              user?.username ||
              "A"
            )
              .slice(0, 2)
              .toUpperCase()}

          </div>


          <div className="flex-1 min-w-0">

            <p className="text-sm font-medium truncate">
              {user?.username ||
                "User"}
            </p>

            <p className="text-[11px] text-muted capitalize">
              {user?.custom_role_details
                ?.name ||
                user?.role ||
                "Signed in"}
            </p>

          </div>


          <button
            onClick={logout}
            className="text-muted hover:text-coral"
            title="Logout"
          >

            <LogOut
              size={16}
            />

          </button>

        </div>

      </div>

    </aside>
  );
}