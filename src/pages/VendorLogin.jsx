import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Store, Zap, Lock, User } from "lucide-react";
import client from "../api/client";

export default function VendorLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await client.post("/vendor/login/", { username, password });
      // Save Token & Vendor Role in LocalStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user_type", "VENDOR");
      
      // Redirect to Vendor Portal / Dashboard
      navigate("/vendor/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials or account not approved yet.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-card border border-black/[0.04] p-8">
        <div className="flex items-center gap-2 mb-6 justify-center">
          <div className="w-10 h-10 rounded-xl bg-ink flex items-center justify-center">
            <Zap size={20} className="text-volt" strokeWidth={2.5} />
          </div>
          <span className="font-display font-bold text-xl text-ink tracking-wide">VOLTRA</span>
        </div>

        <div className="text-center mb-6">
          <h1 className="font-display text-2xl font-bold text-ink">Vendor Portal Login</h1>
          <p className="text-xs text-muted mt-1">Access your approved vendor account & product catalog</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-coral/10 text-coral text-xs text-center border border-coral/20">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted block mb-1">Username / Mobile</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter vendor username"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted block mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-volt font-medium py-2.5 rounded-lg hover:bg-ink-soft transition-colors disabled:opacity-60 text-sm"
          >
            {loading ? "Signing in..." : "Login to Vendor Portal"}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-black/[0.05] text-center space-y-2">
          <p className="text-xs text-muted">
            New Vendor?{" "}
            <Link to="/vendors/register" className="text-emerald font-medium hover:underline">
              Register Business Here
            </Link>
          </p>
          <p className="text-xs text-muted">
            Are you CRM Staff/Admin?{" "}
            <Link to="/login" className="text-ink font-medium hover:underline">
              Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}