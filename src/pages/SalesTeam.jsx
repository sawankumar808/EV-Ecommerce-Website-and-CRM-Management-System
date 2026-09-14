import { useEffect, useState } from "react";
import { UserPlus, Trophy, X } from "lucide-react";
import client from "../api/client";
import { Card, PageHeader, Button } from "../components/ui";

export default function SalesTeam() {
  const [team, setTeam] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    mobile_number: "",
    password: "",
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  function fetchTeam() {
    client
      .get("/api/sales-team-summary/")
      .then((r) => setTeam(r.data.results || r.data))
      .catch((e) => console.error("Failed to fetch sales team:", e));
  }

  async function handleCreateSalesperson(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await client.post("/api/users/", {
        username: form.username,
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        phone: form.mobile_number, // Pass as 'phone' to match backend model
        password: form.password,
        role: "SALES",
      });
      setShowModal(false);
      setForm({
        first_name: "",
        last_name: "",
        username: "",
        email: "",
        mobile_number: "",
        password: "",
      });
      fetchTeam();
    } catch (err) {
      if (err.response?.data) {
        const data = err.response.data;
        const msg = typeof data === "object" 
          ? Object.entries(data).map(([k, v]) => `${k}: ${v}`).join(" | ")
          : String(data);
        setError(msg);
      } else {
        setError("Failed to create salesperson.");
      }
    } finally {
      setLoading(false);
    }
  }

  const sorted = Array.isArray(team) ? [...team].sort((a, b) => (b.won_deals || 0) - (a.won_deals || 0)) : [];

  return (
    <div>
      <PageHeader
        title="Sales Team"
        subtitle="Employee performance, assigned vendors and conversion rate."
        action={
          <Button variant="primary" onClick={() => setShowModal(true)}>
            <UserPlus size={15} /> Add Salesperson
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">Rank</th>
              <th className="text-left font-medium px-5 py-3">Name</th>
              <th className="text-left font-medium px-5 py-3">Employee ID</th>
              <th className="text-left font-medium px-5 py-3">Assigned Vendors</th>
              <th className="text-left font-medium px-5 py-3">Customers</th>
              <th className="text-left font-medium px-5 py-3">Coupons</th>
              <th className="text-left font-medium px-5 py-3">Won / Lost</th>
              <th className="text-left font-medium px-5 py-3">Conversion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {sorted.map((s, i) => (
              <tr key={s.id || i} className="hover:bg-surface/60">
                <td className="px-5 py-3">
                  {i === 0 ? (
                    <Trophy size={15} className="text-amber" />
                  ) : (
                    <span className="text-muted text-xs">#{i + 1}</span>
                  )}
                </td>
                <td className="px-5 py-3 font-medium text-ink">
                  {s.name || `${s.first_name || ""} ${s.last_name || ""}`.trim() || s.username || "—"}
                </td>
                <td className="px-5 py-3 text-muted font-mono text-xs">{s.employee_id || "—"}</td>
                <td className="px-5 py-3 text-muted">{s.assigned_vendors || 0}</td>
                <td className="px-5 py-3 text-muted">{s.assigned_customers || 0}</td>
                <td className="px-5 py-3 text-muted">{s.coupons_generated || 0}</td>
                <td className="px-5 py-3 text-muted">
                  <span className="text-emerald-dark font-medium">{s.won_deals || 0}</span> /{" "}
                  <span className="text-coral font-medium">{s.lost_deals || 0}</span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="charge-bar w-16 bg-black/5 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald h-full" style={{ width: `${s.conversion_rate || 0}%` }} />
                    </div>
                    <span className="text-xs text-muted">{s.conversion_rate || 0}%</span>
                  </div>
                </td>
              </tr>
            ))}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center text-muted py-10">
                  No sales team members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Add Salesperson Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-black/10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-ink">Add Sales Executive</h2>
                <p className="text-xs text-muted">Create credentials for a sales team member</p>
              </div>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X size={18} />
              </button>
            </div>

            {error && <p className="text-coral text-xs mb-3">{error}</p>}

            <form onSubmit={handleCreateSalesperson} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted block mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={form.first_name}
                    onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted block mb-1">Last Name</label>
                  <input
                    type="text"
                    value={form.last_name}
                    onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-muted block mb-1">Username *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={(e) => setForm({ ...form, username: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted block mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted block mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={form.mobile_number}
                  onChange={(e) => setForm({ ...form, mobile_number: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-muted block mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="flex-1" disabled={loading}>
                  {loading ? "Saving..." : "Save Executive"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}