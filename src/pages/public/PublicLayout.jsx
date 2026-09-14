import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { Zap, Menu, X, User } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About Us" },
  { to: "/products", label: "Products" },
  { to: "/contact", label: "Contact Us" },
];

export default function PublicLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <header className="sticky top-0 z-20 bg-ink text-white/90">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-volt flex items-center justify-center">
              <Zap size={17} className="text-ink" strokeWidth={2.5} />
            </div>
            <span className="font-display font-semibold tracking-wide">VOLTRA</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  `text-sm font-medium transition-colors ${isActive ? "text-volt" : "text-white/60 hover:text-white/90"}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {user?.role === "VENDOR" ? (
              <button
                onClick={() => navigate("/vendor-dashboard")}
                className="flex items-center gap-2 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-lg hover:bg-white/15"
              >
                <User size={14} /> My Dashboard
              </button>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-white/70 hover:text-white">Login</Link>
                <Link to="/vendor/register" className="text-sm font-medium bg-volt text-ink px-3.5 py-1.5 rounded-lg">
                  Vendor Registration
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden text-white" onClick={() => setOpen((o) => !o)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {open && (
          <div className="md:hidden bg-ink-soft border-t border-ink-border px-4 py-4 space-y-3">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === "/"} onClick={() => setOpen(false)}
                className="block text-sm font-medium text-white/85">
                {item.label}
              </NavLink>
            ))}
            <Link to="/login" onClick={() => setOpen(false)} className="block text-sm font-medium text-white/85">Login</Link>
            <Link to="/vendor/register" onClick={() => setOpen(false)} className="block text-sm font-medium text-volt">Vendor Registration</Link>
          </div>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-ink text-white/50 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-10 grid sm:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-volt flex items-center justify-center">
                <Zap size={14} className="text-ink" strokeWidth={2.5} />
              </div>
              <span className="font-display font-semibold text-white/90">VOLTRA</span>
            </div>
            <p className="text-sm">EV batteries and scooters, built for vendors and fleets across India.</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40 mb-3">Company</p>
            <div className="space-y-2 text-sm">
              <Link to="/about" className="block hover:text-white/80">About Us</Link>
              <Link to="/contact" className="block hover:text-white/80">Contact Us</Link>
              <Link to="/products" className="block hover:text-white/80">Products</Link>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-white/40 mb-3">Legal</p>
            <div className="space-y-2 text-sm">
              <Link to="/terms" className="block hover:text-white/80">Terms & Conditions</Link>
              <Link to="/privacy" className="block hover:text-white/80">Privacy Policy</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 py-4 text-center text-xs">
          © {new Date().getFullYear()} Voltra Mobility Pvt. Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}