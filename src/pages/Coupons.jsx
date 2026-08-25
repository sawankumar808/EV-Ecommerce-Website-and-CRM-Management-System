import { useEffect, useState } from "react";
import client from "../api/client";
import { Card, PageHeader, StatusBadge, Button } from "../components/ui";

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);

  useEffect(() => {
    client.get("/coupons/").then((r) => setCoupons(r.data.results || r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Coupon Management" subtitle="Sales team can generate and track coupon usage." action={<Button>+ Generate Coupon</Button>} />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">Code</th>
              <th className="text-left font-medium px-5 py-3">Discount</th>
              <th className="text-left font-medium px-5 py-3">Created By</th>
              <th className="text-left font-medium px-5 py-3">Usage</th>
              <th className="text-left font-medium px-5 py-3">Expiry</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-surface/60">
                <td className="px-5 py-3 font-mono text-xs font-semibold text-ink">{c.code}</td>
                <td className="px-5 py-3 text-muted">
                  {c.discount_type === "PERCENTAGE" ? `${c.discount_value}%` : `₹${c.discount_value}`}
                </td>
                <td className="px-5 py-3 text-muted">{c.created_by_name || "—"}</td>
                <td className="px-5 py-3 text-muted">{c.times_used}/{c.usage_limit}</td>
                <td className="px-5 py-3 text-muted">{c.expiry_date}</td>
                <td className="px-5 py-3"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
            {coupons.length === 0 && <tr><td colSpan={6} className="text-center text-muted py-10">No coupons yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
