import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, BatteryCharging, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [role, setRole] = useState("ADMIN");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      // 1. Authenticate user via AuthContext
      const userProfile = await login(username, password, role);

      // 2. Determine actual user role (fallback to selected role if profile field is empty)
      const userRole = userProfile?.role || role;

      // 3. Perform Redirection based on verified role
      if (userRole === "VENDOR") {
        navigate("/vendor-dashboard", { replace: true });
      } else {
        // ADMIN & SALES access CRM Panel
        navigate("/crm", { replace: true });
      }
    } catch (err) {
      console.error("Login Submission Error:", err);
      setError(
        err.response?.data?.detail ||
        err.message ||
        "Invalid credentials or incorrect role selected."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-surface">
      {/* Left Banner Section */}
      <div className="hidden lg:flex flex-col justify-between bg-ink text-white p-12 relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-emerald/10 blur-3xl" />
        <div className="absolute right-10 top-10 w-64 h-64 rounded-full bg-volt/10 blur-3xl" />
        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-volt flex items-center justify-center">
            <Zap size={20} className="text-ink" strokeWidth={2.5} />
          </div>
          <p className="font-display font-semibold tracking-wide">VOLTRA CRM</p>
        </div>

        <div className="relative z-10">
          <BatteryCharging size={40} className="text-volt mb-6" strokeWidth={1.5} />
          <h1 className="font-display text-4xl font-semibold leading-tight max-w-md">
            One charge, one dashboard — vendors, batteries and sales in sync.
          </h1>
          <p className="text-white/50 mt-4 max-w-sm text-sm leading-relaxed">
            Track every battery from batch to installation, manage vendor onboarding end to end,
            and run your sales pipeline without leaving one screen.
          </p>
          <div className="charge-bar w-64 mt-8">
            <span style={{ width: "72%" }} />
          </div>
          <p className="text-[11px] text-muted mt-2 font-mono">SYSTEM STATUS · OPERATIONAL</p>
        </div>

        <p className="relative z-10 text-xs text-muted">© {new Date().getFullYear()} Voltra Mobility Pvt. Ltd.</p>
      </div>

      {/* Right Login Form Section */}
      <div className="flex items-center justify-center p-8">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-muted mb-6">Sign in to your CRM Admin, Sales or Vendor account.</p>

          {/* Role Selection Dropdown */}
          <div className="mb-4">
            <label className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1 mb-1.5">
              <ShieldCheck size={14} className="text-emerald" /> Select Login Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm bg-white font-medium text-ink focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald"
            >
              <option value="ADMIN">CRM Admin</option>
              <option value="SALES">Sales Executive</option>
              <option value="VENDOR">Vendor Partner</option>
            </select>
          </div>

          {/* Username / Mobile Field */}
          <label className="text-xs font-medium text-muted uppercase tracking-wide">Username or Mobile</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mt-1.5 mb-4 px-3 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald"
            placeholder="admin"
            required
          />

          {/* Password Field */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Password</label>
            <a href="#" className="text-xs text-emerald font-medium">Forgot password?</a>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1.5 mb-2 px-3 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald"
            placeholder="••••••••"
            required
          />

          {error && <p className="text-coral text-sm mt-2">{error}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-ink text-volt font-medium py-2.5 rounded-lg hover:bg-ink-soft transition-colors disabled:opacity-60"
          >
            {loading ? "Signing in..." : `Login as ${role}`}
          </button>

          <p className="text-xs text-muted mt-4 text-center">
            New vendor? <Link to="/vendor/register" className="text-emerald font-medium">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}