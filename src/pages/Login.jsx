import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, BatteryCharging, ShieldCheck } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [role, setRole] = useState("ADMIN");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [bgImage, setBgImage] = useState("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1200");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const saved = localStorage.getItem("voltra_site_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.loginBgImage) setBgImage(parsed.loginBgImage);
      } catch (e) {}
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const userProfile = await login(username, password, role);
      const userRole = userProfile?.role || role;

      if (userRole === "VENDOR") {
        navigate("/vendor/dashboard", { replace: true });
      } else {
        navigate("/crm/dashboard", { replace: true });
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
      {/* Left Banner Section with Dynamic Background Image */}
      <div 
        className="hidden lg:flex flex-col justify-between p-12 relative overflow-hidden text-white bg-cover bg-center"
        style={{ backgroundImage: `url('${bgImage}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/40 backdrop-blur-[2px]" />

        <div className="relative z-10 flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-volt flex items-center justify-center shadow-lg">
            <Zap size={20} className="text-ink" strokeWidth={2.5} />
          </div>
          <p className="font-display font-bold tracking-wide text-lg text-white">VOLTRA CRM</p>
        </div>

        <div className="relative z-10 my-auto py-8">
          <BatteryCharging size={40} className="text-volt mb-6 animate-pulse" strokeWidth={1.5} />
          <h1 className="font-display text-4xl font-extrabold leading-tight max-w-md text-white drop-shadow-md">
            One charge, one dashboard — vendors, batteries and sales in sync.
          </h1>
          <p className="text-white/80 mt-4 max-w-sm text-sm leading-relaxed font-medium">
            Track every battery from batch to installation, manage vendor onboarding end to end,
            and run your sales pipeline without leaving one screen.
          </p>
          <div className="charge-bar w-64 mt-8 bg-white/20">
            <span style={{ width: "72%" }} className="bg-volt" />
          </div>
          <p className="text-[11px] text-volt mt-2 font-mono tracking-widest">SYSTEM STATUS · OPERATIONAL</p>
        </div>

        <p className="relative z-10 text-xs text-white/60 font-medium">© {new Date().getFullYear()} Voltra Mobility Pvt. Ltd.</p>
      </div>

      {/* Right Login Form Section */}
      <div className="flex items-center justify-center p-8 bg-white">
        <form onSubmit={handleSubmit} className="w-full max-w-sm">
          <h2 className="font-display text-2xl font-semibold text-ink mb-1">Welcome back</h2>
          <p className="text-sm text-muted mb-6">Sign in to your CRM Admin, Sales or Vendor account.</p>

          <div className="mb-4">
            <label className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1 mb-1.5">
              <ShieldCheck size={14} className="text-emerald-600" /> Select Login Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-black/10 text-sm bg-white font-medium text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            >
              <option value="ADMIN">CRM Admin</option>
              <option value="SALES">Sales Executive</option>
              <option value="VENDOR">Vendor Partner</option>
            </select>
          </div>

          <label className="text-xs font-medium text-muted uppercase tracking-wide">Username or Mobile</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mt-1.5 mb-4 px-3 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            placeholder="admin"
            required
          />

          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-muted uppercase tracking-wide">Password</label>
            <a href="#" className="text-xs text-emerald-600 font-medium hover:underline">Forgot password?</a>
          </div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mt-1.5 mb-2 px-3 py-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500"
            placeholder="••••••••"
            required
          />

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-ink text-white font-medium py-2.5 rounded-lg hover:bg-black/90 transition-colors disabled:opacity-60 shadow-md"
          >
            {loading ? "Signing in..." : `Login as ${role}`}
          </button>

          <p className="text-xs text-muted mt-4 text-center">
            New vendor? <Link to="/vendor/register" className="text-emerald-600 font-medium hover:underline">Register here</Link>
          </p>
        </form>
      </div>
    </div>
  );
}