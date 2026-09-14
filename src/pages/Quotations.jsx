import { useEffect, useState } from "react";
import { Plus, Trash2, X } from "lucide-react";
import client from "../api/client";
import { Card, PageHeader, StatusBadge, Button } from "../components/ui";

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);
  const [salesTeam, setSalesTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [currentUser, setCurrentUser] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    quotation_number: "",
    customer_name: "",
    sales_person: "",
    total_amount: "",
    status: "DRAFT",
    version: 1,
  });

  const syncUserContext = () => {
    let username = "";
    let userId = "";
    let role = "SALES";
    let isSuper = false;

    const possibleUserKeys = [
      "username",
      "user_name",
      "name",
      "email",
      "user",
      "auth_user",
      "userData",
    ];

    for (const key of possibleUserKeys) {
      const val = localStorage.getItem(key);
      if (val) {
        if (val.startsWith("{")) {
          try {
            const parsed = JSON.parse(val);
            username =
              parsed.username ||
              parsed.name ||
              parsed.first_name ||
              parsed.email ||
              username;
            userId = parsed.id || userId;
            if (parsed.role) role = parsed.role;
            if (parsed.is_superuser || parsed.is_staff) isSuper = true;
          } catch (e) {}
        } else if (!username) {
          username = val;
        }
      }
    }

    const storedId = localStorage.getItem("user_id") || localStorage.getItem("id");
    if (storedId) userId = storedId;

    const storedRole = (
      localStorage.getItem("role") ||
      localStorage.getItem("user_role") ||
      role
    )
      .toString()
      .toUpperCase();

    const isStaff = localStorage.getItem("is_staff") === "true";
    const isSuperuser = localStorage.getItem("is_superuser") === "true";

    const adminCheck =
      storedRole.includes("ADMIN") || isSuper || isStaff || isSuperuser;

    if (!username) {
      username = "User";
    }

    setCurrentUser(username);
    setCurrentUserId(userId);
    setIsAdmin(adminCheck);

    return { username, userId, adminCheck };
  };

  const fetchSalesTeam = async () => {
    const endpoints = ["/api/sales-team/", "/api/users/", "/api/crm/users/", "/sales-team/", "/users/"];

    let rawUsers = [];

    for (const url of endpoints) {
      try {
        const res = await client.get(url);
        const data = res.data.results || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          rawUsers = data;
          break;
        }
      } catch {
        continue;
      }
    }

    const salesOnly = rawUsers.filter((u) => {
      const role = (u.role || u.user_role || u.type || "").toString().toLowerCase();
      if (role.includes("vendor") || role.includes("supplier")) {
        return false;
      }
      return true;
    });

    const uniqueUsers = [];
    const seenKeys = new Set();

    salesOnly.forEach((u) => {
      const identifier = (u.id || u.username || u.email || "").toString().toLowerCase();
      if (identifier && !seenKeys.has(identifier)) {
        seenKeys.add(identifier);
        uniqueUsers.push(u);
      }
    });

    return uniqueUsers;
  };

  const fetchQuotations = async () => {
    const endpoints = ["/api/quotations/", "/api/crm/quotations/", "/quotations/", "/crm/quotations/"];
    for (const url of endpoints) {
      try {
        const res = await client.get(url);
        return res.data.results || res.data || [];
      } catch {
        continue;
      }
    }
    return [];
  };

  const fetchData = async () => {
    setLoading(true);
    const userCtx = syncUserContext();
    const [quotes, team] = await Promise.all([fetchQuotations(), fetchSalesTeam()]);
    setQuotations(quotes);
    setSalesTeam(team);

    if (!userCtx.adminCheck && userCtx.userId) {
      setFormData((prev) => ({ ...prev, sales_person: userCtx.userId }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = () => {
    const userCtx = syncUserContext();
    setFormData({
      quotation_number: `QT-${Math.floor(1000 + Math.random() * 9000)}`,
      customer_name: "",
      sales_person: !userCtx.adminCheck && userCtx.userId ? userCtx.userId : "",
      total_amount: "",
      status: "DRAFT",
      version: 1,
    });
    setShowModal(true);
  };

  const handleStatusChange = async (id, newStatus) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: newStatus } : q))
    );
    try {
      await client
        .patch(`/api/quotations/${id}/`, { status: newStatus })
        .catch(() => client.patch(`/quotations/${id}/`, { status: newStatus }));
    } catch (err) {
      alert("Status update failed.");
      fetchData();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this quotation?")) return;
    try {
      await client
        .delete(`/api/quotations/${id}/`)
        .catch(() => client.delete(`/quotations/${id}/`));
      setQuotations((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      alert("Error deleting quotation.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (payload.sales_person) {
        payload.sales_person = parseInt(payload.sales_person, 10);
      }
      if (payload.total_amount) {
        payload.total_amount = parseFloat(payload.total_amount);
      }

      await client
        .post("/api/quotations/", payload)
        .catch(() => client.post("/quotations/", payload));
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Quotation save error: " + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quotations"
        subtitle="Create and manage customer quotations."
        action={
          <Button onClick={handleOpenModal}>
            <Plus size={15} /> New Quotation
          </Button>
        }
      />

      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted">Loading quotations...</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted text-xs uppercase tracking-wide border-b">
              <tr>
                <th className="text-left font-medium px-5 py-3">Quote #</th>
                <th className="text-left font-medium px-5 py-3">Customer / Lead</th>
                <th className="text-left font-medium px-5 py-3">Sales Person</th>
                <th className="text-left font-medium px-5 py-3">Total Amount</th>
                <th className="text-left font-medium px-5 py-3">Status</th>
                <th className="text-left font-medium px-5 py-3">Change Status</th>
                <th className="text-right font-medium px-5 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-surface/60">
                  <td className="px-5 py-3 font-mono text-xs font-semibold text-ink">
                    {q.quotation_number || `QT-${q.id}`}
                  </td>
                  <td className="px-5 py-3 font-medium text-ink">
                    {q.customer_name || q.lead_name || q.customer || "—"}
                  </td>
                  <td className="px-5 py-3 text-muted">
                    {q.sales_person_name || q.sales_person || "Unassigned"}
                  </td>
                  <td className="px-5 py-3 font-medium text-ink">
                    ₹{Number(q.total_amount || 0).toLocaleString("en-IN")}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={q.status || "DRAFT"} />
                  </td>
                  <td className="px-5 py-3">
                    <select
                      value={q.status || "DRAFT"}
                      onChange={(e) => handleStatusChange(q.id, e.target.value)}
                      className="bg-white border rounded px-2 py-1 text-xs font-medium text-ink focus:outline-none"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SENT">Sent</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {quotations.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-10">
                    No quotations found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-semibold text-ink">Create New Quotation</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1">Quote Number</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 text-sm bg-black/[0.02]"
                  value={formData.quotation_number}
                  onChange={(e) => setFormData({ ...formData, quotation_number: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs text-muted block mb-1">Customer / Lead Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                />
              </div>

              {/* SALES PERSON + ADMIN SELECTION */}
              <div>
                <label className="text-xs text-muted block mb-1">Sales Person *</label>
                {isAdmin ? (
                  <select
                    className="w-full border rounded-lg p-2 text-sm bg-white"
                    value={formData.sales_person}
                    onChange={(e) => setFormData({ ...formData, sales_person: e.target.value })}
                    required
                  >
                    <option value="">Select Sales Person / Admin</option>
                    {salesTeam.map((person) => {
                      const pId = person.id;
                      const pName = person.first_name ? `${person.first_name} ${person.last_name || ""}`.trim() : (person.username || person.email);
                      return (
                        <option key={pId} value={pId}>
                          {pName} ({person.email || person.username})
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    readOnly
                    className="w-full border rounded-lg p-2 text-sm bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
                    value={`${currentUser} (Sales Executive)`}
                  />
                )}
              </div>

              <div>
                <label className="text-xs text-muted block mb-1">Total Amount (₹) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 75000"
                  className="w-full border rounded-lg p-2 text-sm"
                  value={formData.total_amount}
                  onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-muted hover:bg-black/5 rounded-lg"
                >
                  Cancel
                </button>
                <Button type="submit">Save Quotation</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}