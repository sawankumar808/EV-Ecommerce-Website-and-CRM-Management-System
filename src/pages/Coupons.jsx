import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import client from "../api/client";
import { Card, PageHeader, StatusBadge, Button } from "../components/ui";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Today's date in YYYY-MM-DD format
  const todayStr = new Date().toISOString().split("T")[0];

  const [couponForm, setCouponForm] = useState({
    code: "",
    discount_type: "PERCENTAGE",
    discount_value: "",
    minimum_purchase: "0",
    usage_limit: "1",
    start_date: todayStr,
    expiry_date: "",
  });

  const fetchCoupons = () => {
    client
      .get("/coupons/")
      .then((r) => setCoupons(r.data.results || r.data))
      .catch((err) => console.error("Error fetching coupons:", err));
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend Django Model ke exact fields ke according payload:
      const payload = {
        code: couponForm.code.trim().toUpperCase(),
        discount_type: couponForm.discount_type,
        discount_value: parseFloat(couponForm.discount_value),
        minimum_purchase: parseFloat(couponForm.minimum_purchase || 0),
        usage_limit: parseInt(couponForm.usage_limit, 10) || 1,
        start_date: couponForm.start_date, // Pure 'YYYY-MM-DD' string
        expiry_date: couponForm.expiry_date, // Pure 'YYYY-MM-DD' string
        status: "ACTIVE",
      };

      await client.post("/coupons/", payload);
      alert("Coupon created successfully!");
      setShowCreateModal(false);
      setCouponForm({
        code: "",
        discount_type: "PERCENTAGE",
        discount_value: "",
        minimum_purchase: "0",
        usage_limit: "1",
        start_date: todayStr,
        expiry_date: "",
      });
      fetchCoupons();
    } catch (err) {
      console.error("Coupon creation error:", err.response?.data);
      const errorMsg =
        typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response?.data?.detail || "Failed to generate coupon";
      alert(`Failed to save: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Coupon Management"
        subtitle="Sales team can generate and track coupon usage."
        action={
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus size={15} /> Generate Coupon
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">Code</th>
              <th className="text-left font-medium px-5 py-3">Discount</th>
              <th className="text-left font-medium px-5 py-3">Usage</th>
              <th className="text-left font-medium px-5 py-3">Start Date</th>
              <th className="text-left font-medium px-5 py-3">Expiry Date</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-surface/60">
                <td className="px-5 py-3 font-mono text-xs font-semibold text-ink">
                  {c.code}
                </td>
                <td className="px-5 py-3 text-muted">
                  {c.discount_type === "PERCENTAGE"
                    ? `${c.discount_value}%`
                    : `₹${c.discount_value}`}
                </td>
                <td className="px-5 py-3 text-muted">
                  {c.times_used || 0}/{c.usage_limit || 1}
                </td>
                <td className="px-5 py-3 text-muted">{c.start_date || "—"}</td>
                <td className="px-5 py-3 text-muted">{c.expiry_date || "—"}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={c.status} />
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center text-muted py-10">
                  No coupons yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Generate Coupon Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-xl border border-black/10">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-3 right-3 text-muted hover:text-ink"
            >
              <X size={18} />
            </button>
            <h3 className="font-display font-semibold text-lg text-ink mb-4">
              Generate New Coupon
            </h3>
            <form onSubmit={handleCreateCoupon} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">
                  Coupon Code
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAVE20"
                  className="w-full px-3 py-2 border rounded-lg uppercase"
                  value={couponForm.code}
                  onChange={(e) =>
                    setCouponForm({ ...couponForm, code: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Discount Type
                  </label>
                  <select
                    className="w-full px-3 py-2 border rounded-lg"
                    value={couponForm.discount_type}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discount_type: e.target.value,
                      })
                    }
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="10 or 500"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={couponForm.discount_value}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        discount_value: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    min="1"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={couponForm.usage_limit}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        usage_limit: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Min Purchase Amount
                  </label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border rounded-lg"
                    value={couponForm.minimum_purchase}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        minimum_purchase: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={couponForm.start_date}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        start_date: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={couponForm.expiry_date}
                    onChange={(e) =>
                      setCouponForm({
                        ...couponForm,
                        expiry_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Generating..." : "Generate"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}