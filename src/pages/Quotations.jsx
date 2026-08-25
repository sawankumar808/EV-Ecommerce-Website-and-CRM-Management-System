import { useEffect, useState } from "react";
import client from "../api/client";
import { Card, PageHeader, StatusBadge, Button } from "../components/ui";

export default function Quotations() {
  const [quotations, setQuotations] = useState([]);

  useEffect(() => {
    client.get("/quotations/").then((r) => setQuotations(r.data.results || r.data)).catch(() => {});
  }, []);

  return (
    <div>
      <PageHeader title="Quotations" subtitle="Create, send and revise quotations for leads & customers." action={<Button>+ New Quotation</Button>} />
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-5 py-3">Quotation #</th>
              <th className="text-left font-medium px-5 py-3">Lead / Customer</th>
              <th className="text-left font-medium px-5 py-3">Total</th>
              <th className="text-left font-medium px-5 py-3">Version</th>
              <th className="text-left font-medium px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {quotations.map((q) => (
              <tr key={q.id} className="hover:bg-surface/60">
                <td className="px-5 py-3 font-mono text-xs font-medium text-ink">{q.quotation_number}</td>
                <td className="px-5 py-3 text-muted">{q.lead_name || q.customer_name || "—"}</td>
                <td className="px-5 py-3 text-muted">₹{Number(q.total_amount || 0).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3 text-muted">v{q.version}</td>
                <td className="px-5 py-3"><StatusBadge status={q.status} /></td>
              </tr>
            ))}
            {quotations.length === 0 && <tr><td colSpan={5} className="text-center text-muted py-10">No quotations yet.</td></tr>}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
