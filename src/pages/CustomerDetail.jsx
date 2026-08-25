import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, BatteryCharging, Bike, FileText } from "lucide-react";
import client from "../api/client";
import { Card, StatusBadge } from "../components/ui";

export default function CustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    client.get(`/customers/${id}/full_history/`).then((r) => setData(r.data)).catch(() => {});
  }, [id]);

  if (!data) return <div className="text-muted py-10 text-center">Loading…</div>;

  const { customer, batteries, scooters, quotations } = data;

  return (
    <div>
      <Link to="/crm/customers" className="text-sm text-muted flex items-center gap-1.5 mb-4 hover:text-ink">
        <ArrowLeft size={14} /> Back to Customers
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">{customer.name}</h1>
          <p className="text-sm text-muted mt-1">{customer.mobile} · {customer.email || "no email"} · {customer.city}, {customer.state}</p>
        </div>
        <span className="text-xs font-medium bg-black/5 text-muted px-2.5 py-1 rounded-full">{customer.category}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Vendor</p>
          <p className="text-sm font-medium text-ink">{customer.vendor_name || "—"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Salesperson</p>
          <p className="text-sm font-medium text-ink">{customer.salesperson_name || "—"}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted uppercase tracking-wide mb-1">Address</p>
          <p className="text-sm font-medium text-ink truncate">{customer.address || "—"}</p>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
            <BatteryCharging size={16} className="text-emerald" /> Battery Information
          </h3>
          <div className="space-y-3">
            {batteries.map((b) => (
              <div key={b.id} className="flex items-center justify-between border-b border-black/[0.05] pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-mono font-medium text-ink">{b.battery_id}</p>
                  <p className="text-xs text-muted">{b.model} · Batch {b.batch_number} · {b.g_code}</p>
                  <p className="text-xs text-muted">Warranty: {b.warranty_start || "—"} → {b.warranty_end || "—"}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
            ))}
            {batteries.length === 0 && <p className="text-sm text-muted">No batteries assigned yet.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
            <Bike size={16} className="text-emerald" /> Scooter Information
          </h3>
          <div className="space-y-3">
            {scooters.map((s) => (
              <div key={s.id} className="flex items-center justify-between border-b border-black/[0.05] pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-mono font-medium text-ink">{s.scooter_id}</p>
                  <p className="text-xs text-muted">{s.brand} {s.model} · {s.registration_number || "unregistered"}</p>
                </div>
                <StatusBadge status={s.status} />
              </div>
            ))}
            {scooters.length === 0 && <p className="text-sm text-muted">No scooters linked yet.</p>}
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <h3 className="font-display font-semibold text-ink mb-4 flex items-center gap-2">
            <FileText size={16} className="text-emerald" /> Purchase / Quotation History
          </h3>
          <div className="space-y-3">
            {quotations.map((q) => (
              <div key={q.id} className="flex items-center justify-between border-b border-black/[0.05] pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="text-sm font-mono font-medium text-ink">{q.quotation_number}</p>
                  <p className="text-xs text-muted">{new Date(q.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-ink">₹{Number(q.total_amount).toLocaleString("en-IN")}</p>
                  <StatusBadge status={q.status} />
                </div>
              </div>
            ))}
            {quotations.length === 0 && <p className="text-sm text-muted">No purchases yet.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}
