import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Zap, LogOut, BatteryCharging, Users2, Bike, Package, ShoppingBag, Clock,
} from "lucide-react";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card, StatusBadge } from "../components/ui";

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [tab, setTab] = useState("overview");
  const [customerForm,setCustomerForm]=useState({name:"",mobile:"",email:"",city:"",state:"",pincode:"",address:""});
  const [customerMsg,setCustomerMsg]=useState("");
  const [error, setError] = useState("");
  const { logout, user } = useAuth();

  useEffect(() => {
    client.get("/vendor/me/").then((r) => setVendor(r.data)).catch((e) => {
      setError(e.response?.data?.detail || "Could not load your vendor profile.");
    });
  }, []);

  useEffect(() => {
    if (tab === "products" && vendor?.status === "APPROVED") {
      client.get("/vendor/products/").then((r) => setProducts(r.data)).catch(() => {});
    }
  }, [tab, vendor]);

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-coral font-medium mb-2">{error}</p>
          <Link to="/" className="text-emerald text-sm">Back to homepage</Link>
        </div>
      </div>
    );
  }

  if (!vendor) return <div className="min-h-screen bg-surface flex items-center justify-center text-muted">Loading your dashboard…</div>;

  const stats = vendor.stats || {};
  const notApproved = vendor.status !== "APPROVED";

  return (
    <div className="min-h-screen bg-surface">
      <header className="bg-ink text-white h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-volt flex items-center justify-center">
            <Zap size={17} className="text-ink" strokeWidth={2.5} />
          </div>
          <span className="font-display font-semibold tracking-wide">VOLTRA · Vendor Portal</span>
        </div>
        <button onClick={logout} className="flex items-center gap-2 text-sm text-white/70 hover:text-white">
          <LogOut size={15} /> Logout
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{vendor.business_name}</h1>
            <p className="text-sm text-muted mt-1">{vendor.contact_person} · {vendor.city}, {vendor.state}</p>
          </div>
          <StatusBadge status={vendor.status} />
        </div>

        {notApproved && (
          <Card className="p-5 mb-6 border-l-4 border-l-amber flex items-start gap-3">
            <Clock size={18} className="text-amber mt-0.5" />
            <div>
              <p className="font-medium text-ink">Your account is {vendor.status.replace("_", " ").toLowerCase()}</p>
              <p className="text-sm text-muted mt-1">
                Product prices, orders and battery details unlock automatically once the CRM Admin approves your account.
              </p>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ShoppingBag} label="Total Orders" value={stats.total_orders ?? 0} />
          <StatCard icon={BatteryCharging} label="Assigned Batteries" value={stats.assigned_batteries ?? 0} />
          <StatCard icon={Users2} label="Customers" value={stats.total_customers ?? 0} />
          <StatCard icon={Bike} label="Scooters" value={stats.total_scooters ?? 0} />
        </div>

        <div className="flex gap-2 mb-4">
          {["overview", "products", "customers"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${tab === t ? "bg-ink text-volt" : "bg-white text-muted border border-black/10"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "overview" && (
          <Card className="p-5">
            <h3 className="font-display font-semibold text-ink mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {(vendor.activities || []).slice(0, 8).map((a) => (
                <div key={a.id} className="flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm text-ink">{a.description}</p>
                    <p className="text-xs text-muted">{new Date(a.created_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {(vendor.activities || []).length === 0 && <p className="text-sm text-muted">No activity yet.</p>}
            </div>
          </Card>
        )}

        {tab === "customers" && !notApproved && (
          <Card className="p-5"><h3 className="font-display font-semibold mb-4">Add Customer</h3><form className="grid md:grid-cols-2 gap-3" onSubmit={async e=>{e.preventDefault();try{await client.post("/vendor/customers/",customerForm);setCustomerMsg("Customer added successfully");setCustomerForm({name:"",mobile:"",email:"",city:"",state:"",pincode:"",address:""})}catch(err){setCustomerMsg(JSON.stringify(err.response?.data||err.message))}}}><input required placeholder="Customer name" className="border rounded-lg p-2 text-sm" value={customerForm.name} onChange={e=>setCustomerForm({...customerForm,name:e.target.value})}/><input required placeholder="Mobile" className="border rounded-lg p-2 text-sm" value={customerForm.mobile} onChange={e=>setCustomerForm({...customerForm,mobile:e.target.value})}/><input placeholder="Email" className="border rounded-lg p-2 text-sm" value={customerForm.email} onChange={e=>setCustomerForm({...customerForm,email:e.target.value})}/><input placeholder="City" className="border rounded-lg p-2 text-sm" value={customerForm.city} onChange={e=>setCustomerForm({...customerForm,city:e.target.value})}/><input placeholder="State" className="border rounded-lg p-2 text-sm" value={customerForm.state} onChange={e=>setCustomerForm({...customerForm,state:e.target.value})}/><input placeholder="Pincode" className="border rounded-lg p-2 text-sm" value={customerForm.pincode} onChange={e=>setCustomerForm({...customerForm,pincode:e.target.value})}/><input placeholder="Address" className="border rounded-lg p-2 text-sm md:col-span-2" value={customerForm.address} onChange={e=>setCustomerForm({...customerForm,address:e.target.value})}/><button className="bg-ink text-volt rounded-lg px-4 py-2 text-sm font-medium w-fit">Add Customer</button></form>{customerMsg&&<p className="text-sm text-muted mt-3">{customerMsg}</p>}</Card>
        )}

        {tab === "products" && (
          notApproved ? (
            <Card className="p-8 text-center text-muted text-sm">Products & prices will appear here after approval.</Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <Card key={p.id} className="p-4">
                  <div className="h-28 bg-surface rounded-lg flex items-center justify-center mb-3">
                    <Package size={28} className="text-emerald/40" />
                  </div>
                  <p className="font-medium text-ink text-sm">{p.name}</p>
                  <p className="text-xs text-muted mt-0.5">{p.model_number}</p>
                  <p className="font-display font-semibold text-emerald-dark mt-2">₹{Number(p.price).toLocaleString("en-IN")}</p>
                </Card>
              ))}
              {products.length === 0 && <p className="text-sm text-muted col-span-3">No products available.</p>}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
        <Icon size={15} className="text-emerald" />
      </div>
      <p className="font-display text-xl font-semibold text-ink">{value}</p>
    </Card>
  );
}
