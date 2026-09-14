import { useEffect, useState } from "react";
import { Building2, Users2, BatteryCharging, Ticket, Wallet, TrendingUp, Clock, AlertTriangle } from "lucide-react";
import client from "../api/client";
import { Card, KpiCard, PageHeader, StatusBadge } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [followUps, setFollowUps] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [actualScooterCount, setActualScooterCount] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    client.get("/api/dashboard-summary/").then((r) => setSummary(r.data)).catch((e) => console.error("Summary error:", e));
    client.get("/api/follow-ups/today/").then((r) => setFollowUps(r.data)).catch((e) => console.error("Followups error:", e));
    client.get("/api/vendors/?ordering=-registered_at").then((r) => setVendors(r.data.results || r.data)).catch((e) => console.error("Vendors error:", e));
    
    // Fallback: Direct scooters list fetch karke count nikalna
    client.get("/api/scooters/").then((r) => {
      const list = r.data.results || r.data || [];
      setActualScooterCount(list.length);
    }).catch((e) => console.error("Scooters fetch error:", e));
  }, []);

  const s = summary || {};
  
  // Summary API ya direct scooters length mein se jo bhi available ho use karein
  const totalScootersValue = s.total_scooters > 0 ? s.total_scooters : (actualScooterCount ?? 0);

  return (
    <div>
      <PageHeader 
        title={`Dashboard (${user?.role || "ADMIN"})`} 
        subtitle={user?.role === "SALES" ? "Your assigned sales pipeline and active vendors snapshot." : "Real-time snapshot across vendors, sales and battery operations."} 
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Vendors" value={s.total_vendors ?? "—"} icon={Building2}
          pct={s.total_vendors ? (s.approved_vendors / s.total_vendors) * 100 : 0} />
        <KpiCard label="Pending Approvals" value={s.pending_vendors ?? "—"} icon={Clock} />
        <KpiCard label="Total Customers" value={s.total_customers ?? "—"} icon={Users2} />
        <KpiCard label="Active Coupons" value={s.active_coupons ?? "—"} icon={Ticket} />
        <KpiCard label="Total Sales" value={`₹${Number(s.total_sales_amount||0).toLocaleString("en-IN")}`} icon={TrendingUp} />
        <KpiCard label="Total Scooters" value={totalScootersValue} icon={Wallet} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard label="Total Batteries" value={s.total_batteries ?? "—"} icon={BatteryCharging}
          pct={s.total_batteries ? (s.batteries_in_stock / s.total_batteries) * 100 : 0} />
        <KpiCard label="Batteries in Stock" value={s.batteries_in_stock ?? "—"} icon={BatteryCharging} />
        <KpiCard label="Pipeline Value" value={`₹${Number(s.total_pipeline_value || 0).toLocaleString("en-IN")}`} icon={Wallet} />
        <KpiCard label="Won Deals" value={s.won_deals ?? "—"} icon={TrendingUp} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink">
              {user?.role === "SALES" ? "My Assigned Vendors" : "Recent Vendor Registrations"}
            </h3>
          </div>
          <div className="divide-y divide-black/[0.05]">
            {vendors.slice(0, 6).map((v) => (
              <div key={v.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{v.business_name}</p>
                  <p className="text-xs text-muted">{v.city}, {v.state} · {v.contact_person}</p>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
            {vendors.length === 0 && <p className="text-sm text-muted py-6 text-center">No vendors found.</p>}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-ink">Today's Follow-ups</h3>
            {s.overdue_follow_ups > 0 && (
              <span className="flex items-center gap-1 text-xs text-coral font-medium">
                <AlertTriangle size={13} /> {s.overdue_follow_ups} overdue
              </span>
            )}
          </div>
          <div className="space-y-3">
            {followUps.slice(0, 6).map((f) => (
              <div key={f.id} className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-ink font-medium">{f.lead_name || f.customer_name || "Follow-up"}</p>
                  <p className="text-xs text-muted">{f.follow_up_type} · {new Date(f.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
            {followUps.length === 0 && <p className="text-sm text-muted py-6 text-center">Nothing scheduled today.</p>}
          </div>
        </Card>
      </div>
    </div>
  );
}