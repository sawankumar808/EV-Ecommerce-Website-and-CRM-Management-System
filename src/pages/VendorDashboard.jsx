import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Zap,
  LogOut,
  BatteryCharging,
  Users2,
  Bike,
  ShoppingBag,
  Clock,
  Eye,
  Package,
  X,
  Edit,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";

import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card, StatusBadge } from "../components/ui";

export default function VendorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [batteries, setBatteries] = useState([]);
  const [scooters, setScooters] = useState([]);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderModalProduct, setOrderModalProduct] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const [tab, setTab] = useState("overview");

  const [customerForm, setCustomerForm] = useState({
    name: "",
    mobile: "",
    email: "",
    city: "",
    state: "",
    pincode: "",
    address: "",
  });

  const [orderForm, setOrderForm] = useState({
    quantity: 1,
    delivery_date: "",
    notes: "",
  });

  const [customerMsg, setCustomerMsg] = useState("");
  const [orderMsg, setOrderMsg] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (
      user &&
      user.role !=="VENDOR"

    ){
      navigate("/crm", {
        replace: true,
      })
    }
  }, [user, navigate]);

  const loadVendorData = () => {
    if (user && user.role === "VENDOR") {
      client
        .get("/vendor/me/")
        .then((r) => {
          setVendor(r.data);
          // Backend se jo customers array aayega usko state mein set kar denge
          if (r.data.customers && Array.isArray(r.data.customers)) {
            setCustomers(r.data.customers);
          }
        })
        .catch((e) => {
          setError(
            e.response?.data?.detail || "Could not load your vendor profile."
          );
        });
    }
  };

  useEffect(() => {
    loadVendorData();
  }, [user]);

  // Load Products and Inventory when tabs change
  useEffect(() => {
    if (vendor?.status === "APPROVED") {
      if (tab === "products") {
        client.get("/vendor/products/")
          .then((r) => setProducts(r.data.results || r.data || []))
          .catch((e) => console.error("Error loading products:", e));
      }
      if (tab === "inventory") {
        client.get("/vendor/batteries/")
          .then((r) => setBatteries(r.data.results || r.data || []))
          .catch((e) => console.error("Error loading batteries:", e));
        
        client.get("/vendor/scooters/?status=IN_STOCK")
          .then((r) => setScooters(r.data.results || r.data || []))
          .catch((e) => console.error("Error loading scooters:", e));
      }
    }
  }, [tab, vendor]);

  const handleCustomerSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        const res = await client.patch(`/vendor/customers/${editingCustomer.id}/`, customerForm);
        setCustomerMsg("Customer updated successfully!");
        setCustomers(customers.map((c) => (c.id === editingCustomer.id ? res.data : c)));
        setEditingCustomer(null);
      } else {
        const res = await client.post("/vendor/customers/", customerForm);
        setCustomerMsg("Customer added successfully!");
        setCustomers([...customers, res.data]);
      }
      setCustomerForm({ name: "", mobile: "", email: "", city: "", state: "", pincode: "", address: "" });
      loadVendorData(); // Profile stats aur data refresh karne ke liye
    } catch (err) {
      setCustomerMsg(JSON.stringify(err.response?.data || err.message));
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    try {
      await client.post("/vendor/orders/", {
        product: orderModalProduct.id,
        ...orderForm,
      });
      setOrderMsg("Order placed successfully! Assigned sales/admin has been notified.");
      setOrderForm({ quantity: 1, delivery_date: "", notes: "" });
      setTimeout(() => {
        setOrderModalProduct(null);
        setOrderMsg("");
      }, 2000);
    } catch (err) {
      setOrderMsg(JSON.stringify(err.response?.data || err.message));
    }
  };

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

  if (!vendor) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center text-muted">
        Loading your dashboard…
      </div>
    );
  }

  const stats = vendor.stats || {};
  const notApproved = vendor.status !== "APPROVED";

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
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
        {/* Vendor Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">{vendor.business_name}</h1>
            <p className="text-sm text-muted mt-1">{vendor.contact_person} · {vendor.city}, {vendor.state}</p>
          </div>
          <StatusBadge status={vendor.status} />
        </div>

        {/* Approval Banner */}
        {notApproved && (
          <Card className="p-5 mb-6 border-l-4 border-l-amber flex items-start gap-3">
            <Clock size={18} className="text-amber mt-0.5" />
            <div>
              <p className="font-medium text-ink">Your account is {vendor.status.replace("_", " ").toLowerCase()}</p>
              <p className="text-sm text-muted mt-1">Product catalog and pricing will appear after the CRM Admin approves your account.</p>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={ShoppingBag} label="Total Orders" value={stats.total_orders ?? 0} />
          <StatCard icon={BatteryCharging} label="Assigned Batteries" value={stats.assigned_batteries ?? 0} />
          <StatCard icon={Users2} label="Customers" value={stats.total_customers ?? customers.length} />
          <StatCard icon={Bike} label="Scooters" value={stats.total_scooters ?? 0} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["overview", "products", "customers", "inventory"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                tab === t ? "bg-ink text-volt" : "bg-white text-muted border border-black/10"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Overview */}
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

        {/* Products */}
        {tab === "products" && (
          notApproved ? (
            <Card className="p-8 text-center text-muted text-sm">Products and vendor prices will appear here after approval.</Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => {
                const imageUrl = p.image
                  ? /^https?:\/\//i.test(p.image)
                    ? p.image
                    : `${(import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "")}${p.image.startsWith("/") ? "" : "/"}${p.image}`
                  : null;

                return (
                  <Card key={p.id} className="p-4 bg-white border border-black/[0.06] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
                    <div>
                      <div className="h-28 bg-surface rounded-lg flex items-center justify-center mb-3 overflow-hidden relative">
                        {imageUrl ? (
                          <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <Package size={28} className="text-emerald/40" />
                        )}
                        <span className="absolute top-2 right-2 bg-ink text-white text-[9px] px-2 py-0.5 rounded-full">{p.category || "EV"}</span>
                      </div>
                      <p className="text-xs text-muted">{p.model_number || "EV Model"}</p>
                      <h3 className="font-display text-lg font-semibold text-ink mt-1">{p.name}</h3>
                      <p className="text-sm text-muted mt-2 line-clamp-2">{p.description || "Premium EV product."}</p>
                      <div className="mt-4 p-3 rounded-xl bg-emerald/5 border border-emerald/10">
                        <p className="text-[10px] text-muted uppercase tracking-wider">Your Vendor Price</p>
                        <p className="font-display text-xl font-bold text-emerald-dark">₹{Number(p.price || 0).toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => setSelectedProduct(p)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-surface text-ink text-xs font-medium border">
                        <Eye size={14} /> Details
                      </button>
                      <button onClick={() => setOrderModalProduct(p)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-ink text-volt text-xs font-medium hover:opacity-90">
                        <ShoppingCart size={14} /> Buy / Order
                      </button>
                    </div>
                  </Card>
                );
              })}
              {products.length === 0 && <div className="col-span-full text-center py-16 text-muted border border-dashed rounded-2xl">No products available.</div>}
            </div>
          )
        )}

        {/* Customers & Management */}
        {tab === "customers" && !notApproved && (
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-display font-semibold mb-4">
                {editingCustomer ? "Edit Customer Details" : "Add New Customer"}
              </h3>
              <form className="grid md:grid-cols-2 gap-3" onSubmit={handleCustomerSubmit}>
                <input required placeholder="Customer name" className="border rounded-lg p-2 text-sm" value={customerForm.name} onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })} />
                <input required placeholder="Mobile" className="border rounded-lg p-2 text-sm" value={customerForm.mobile} onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })} />
                <input placeholder="Email" className="border rounded-lg p-2 text-sm" value={customerForm.email} onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })} />
                <input placeholder="City" className="border rounded-lg p-2 text-sm" value={customerForm.city} onChange={(e) => setCustomerForm({ ...customerForm, city: e.target.value })} />
                <input placeholder="State" className="border rounded-lg p-2 text-sm" value={customerForm.state} onChange={(e) => setCustomerForm({ ...customerForm, state: e.target.value })} />
                <input placeholder="Pincode" className="border rounded-lg p-2 text-sm" value={customerForm.pincode} onChange={(e) => setCustomerForm({ ...customerForm, pincode: e.target.value })} />
                <input placeholder="Address" className="border rounded-lg p-2 text-sm md:col-span-2" value={customerForm.address} onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })} />
                <div className="flex gap-2">
                  <button className="bg-ink text-volt rounded-lg px-4 py-2 text-sm font-medium">
                    {editingCustomer ? "Update Customer" : "Add Customer"}
                  </button>
                  {editingCustomer && (
                    <button type="button" onClick={() => { setEditingCustomer(null); setCustomerForm({ name: "", mobile: "", email: "", city: "", state: "", pincode: "", address: "" }); }} className="border rounded-lg px-4 py-2 text-sm">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
              {customerMsg && <p className="text-sm text-emerald mt-3">{customerMsg}</p>}
            </Card>

            {/* Customers Table */}
            <Card className="p-5">
              <h3 className="font-display font-semibold mb-4">Your Customers List</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-muted text-xs uppercase">
                    <tr>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Mobile</th>
                      <th className="text-left p-2">City</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="p-2 font-medium">{c.name}</td>
                        <td className="p-2 text-muted">{c.mobile}</td>
                        <td className="p-2 text-muted">{c.city || "—"}</td>
                        <td className="p-2">
                          <button onClick={() => { setEditingCustomer(c); setCustomerForm(c); }} className="flex items-center gap-1 text-xs px-2.5 py-1 bg-surface border rounded hover:bg-black/5">
                            <Edit size={12} /> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                    {customers.length === 0 && (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">No customers registered yet.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {/* Inventory (Batteries & In-Stock Scooters) */}
        {tab === "inventory" && !notApproved && (
          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="font-display font-semibold mb-4">In-Stock Scooters</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-muted text-xs uppercase">
                    <tr>
                      <th className="text-left p-2">Scooter ID</th>
                      <th className="text-left p-2">Brand/Model</th>
                      <th className="text-left p-2">Status</th>
                      <th className="text-left p-2">Battery Installed</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {scooters.map((s) => (
                      <tr key={s.id}>
                        <td className="p-2 font-mono font-semibold">{s.scooter_id}</td>
                        <td className="p-2">{s.brand} {s.model}</td>
                        <td className="p-2"><StatusBadge status={s.status} /></td>
                        <td className="p-2 text-emerald font-mono text-xs">{s.installed_battery || "None"}</td>
                      </tr>
                    ))}
                    {scooters.length === 0 && <tr><td colSpan={4} className="text-center py-4 text-muted">No in-stock scooters available.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>

            <Card className="p-5">
              <h3 className="font-display font-semibold mb-4">Assigned Batteries History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-surface text-muted text-xs uppercase">
                    <tr>
                      <th className="text-left p-2">Battery ID</th>
                      <th className="text-left p-2">Serial No.</th>
                      <th className="text-left p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {batteries.map((b) => (
                      <tr key={b.id}>
                        <td className="p-2 font-mono font-semibold">{b.battery_id}</td>
                        <td className="p-2">{b.serial_number}</td>
                        <td className="p-2"><StatusBadge status={b.status} /></td>
                      </tr>
                    ))}
                    {batteries.length === 0 && <tr><td colSpan={3} className="text-center py-4 text-muted">No batteries found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center"><X size={16} /></button>
            
            <div className="h-64 bg-surface rounded-xl flex items-center justify-center mb-4 overflow-hidden">
              {selectedProduct.image ? (
                <img 
                  src={/^https?:\/\//i.test(selectedProduct.image) ? selectedProduct.image : `${(import.meta.env.VITE_API_URL || "http://localhost:8000/api").replace(/\/api\/?$/, "")}${selectedProduct.image.startsWith("/") ? "" : "/"}${selectedProduct.image}`} 
                  alt={selectedProduct.name} 
                  className="w-full h-full object-contain" 
                />
              ) : (
                <Package size={48} className="text-emerald/40" />
              )}
            </div>

            <h2 className="text-xl font-semibold font-display mb-1">{selectedProduct.name}</h2>
            <p className="text-xs text-muted mb-3">{selectedProduct.model_number || "EV Model"}</p>
            
            <div className="p-4 bg-emerald/5 rounded-xl mb-4">
              <p className="text-xs text-muted">Your Vendor Price</p>
              <p className="text-xl font-bold text-emerald-dark">₹{Number(selectedProduct.price || 0).toLocaleString("en-IN")}</p>
            </div>

            <div className="mb-4">
              <h4 className="font-semibold text-sm mb-1 text-ink">Description</h4>
              <p className="text-sm text-muted leading-relaxed">{selectedProduct.description || "No description available."}</p>
            </div>

            {selectedProduct.features && (
              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-1 text-ink">Features</h4>
                <p className="text-xs text-muted whitespace-pre-wrap leading-relaxed">{selectedProduct.features}</p>
              </div>
            )}

            {selectedProduct.specifications && (
              <div>
                <h4 className="font-semibold text-sm mb-1 text-ink">Specifications</h4>
                <div className="bg-surface p-3 rounded-lg text-xs text-muted whitespace-pre-wrap">{selectedProduct.specifications}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Buy / Order Modal */}
      {orderModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative">
            <button onClick={() => setOrderModalProduct(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface flex items-center justify-center"><X size={16} /></button>
            <h2 className="text-lg font-semibold font-display mb-1">Order Product</h2>
            <p className="text-xs text-muted mb-4">{orderModalProduct.name}</p>

            <form onSubmit={handleOrderSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Quantity</label>
                <input type="number" min={1} required className="w-full border rounded-lg p-2 text-sm" value={orderForm.quantity} onChange={(e) => setOrderForm({ ...orderForm, quantity: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Required Delivery Date</label>
                <input type="date" required className="w-full border rounded-lg p-2 text-sm" value={orderForm.delivery_date} onChange={(e) => setOrderForm({ ...orderForm, delivery_date: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-medium text-muted block mb-1">Additional Notes / Requirements</label>
                <textarea rows={3} className="w-full border rounded-lg p-2 text-sm" placeholder="Any specific requirements..." value={orderForm.notes} onChange={(e) => setOrderForm({ ...orderForm, notes: e.target.value })} />
              </div>

              <button className="w-full bg-ink text-volt rounded-lg py-2.5 text-sm font-medium">Submit Order to Sales/Admin</button>
            </form>

            {orderMsg && (
              <div className="mt-3 p-3 bg-emerald/10 text-emerald-dark text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 size={16} /> {orderMsg}
              </div>
            )}
          </div>
        </div>
      )}
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