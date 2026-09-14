import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

import client from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Card, StatusBadge } from "../components/ui";

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

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

  const [customerMsg, setCustomerMsg] = useState("");
  const [error, setError] = useState("");

  const { logout } = useAuth();

  useEffect(() => {
    client
      .get("/vendor/me/")
      .then((r) => setVendor(r.data))
      .catch((e) => {
        setError(
          e.response?.data?.detail ||
            "Could not load your vendor profile."
        );
      });
  }, []);

  useEffect(() => {
    if (
      tab === "products" &&
      vendor?.status === "APPROVED"
    ) {
      client
        .get("/vendor/products/")
        .then((r) => setProducts(r.data))
        .catch((e) =>
          console.error(
            "Could not load products:",
            e
          )
        );
    }
  }, [tab, vendor]);

  const getImageUrl = (img) => {
    if (!img) return null;

    if (img.startsWith("http")) return img;

    const base =
      import.meta.env.VITE_API_URL ||
      "http://localhost:8000/api";

    const serverUrl = base.replace(/\/api\/?$/, "");

    return `${serverUrl}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6 text-center">
        <div>
          <p className="text-coral font-medium mb-2">
            {error}
          </p>

          <Link
            to="/"
            className="text-emerald text-sm"
          >
            Back to homepage
          </Link>
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
            <Zap
              size={17}
              className="text-ink"
              strokeWidth={2.5}
            />
          </div>

          <span className="font-display font-semibold tracking-wide">
            VOLTRA · Vendor Portal
          </span>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white"
        >
          <LogOut size={15} />
          Logout
        </button>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Vendor Header */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-display text-2xl font-semibold text-ink">
              {vendor.business_name}
            </h1>

            <p className="text-sm text-muted mt-1">
              {vendor.contact_person} · {vendor.city},{" "}
              {vendor.state}
            </p>
          </div>

          <StatusBadge status={vendor.status} />
        </div>

        {/* Approval */}
        {notApproved && (
          <Card className="p-5 mb-6 border-l-4 border-l-amber flex items-start gap-3">
            <Clock
              size={18}
              className="text-amber mt-0.5"
            />

            <div>
              <p className="font-medium text-ink">
                Your account is{" "}
                {vendor.status
                  .replace("_", " ")
                  .toLowerCase()}
              </p>

              <p className="text-sm text-muted mt-1">
                Product vendor prices will appear after
                the CRM Admin approves your account.
              </p>
            </div>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon={ShoppingBag}
            label="Total Orders"
            value={stats.total_orders ?? 0}
          />

          <StatCard
            icon={BatteryCharging}
            label="Assigned Batteries"
            value={stats.assigned_batteries ?? 0}
          />

          <StatCard
            icon={Users2}
            label="Customers"
            value={stats.total_customers ?? 0}
          />

          <StatCard
            icon={Bike}
            label="Scooters"
            value={stats.total_scooters ?? 0}
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {["overview", "products", "customers"].map(
            (t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize ${
                  tab === t
                    ? "bg-ink text-volt"
                    : "bg-white text-muted border border-black/10"
                }`}
              >
                {t}
              </button>
            )
          )}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <Card className="p-5">
            <h3 className="font-display font-semibold text-ink mb-4">
              Recent Activity
            </h3>

            <div className="space-y-3">
              {(vendor.activities || [])
                .slice(0, 8)
                .map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-emerald mt-1.5 shrink-0" />

                    <div>
                      <p className="text-sm text-ink">
                        {a.description}
                      </p>

                      <p className="text-xs text-muted">
                        {new Date(
                          a.created_at
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

              {(vendor.activities || []).length ===
                0 && (
                <p className="text-sm text-muted">
                  No activity yet.
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Products */}
        {tab === "products" && (
          notApproved ? (
            <Card className="p-8 text-center text-muted text-sm">
              Products and vendor prices will appear
              here after approval.
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

              {products.map((p) => {
                return (
                  <Card
                    key={p.id}
                    className="p-4 bg-white border border-black/[0.06] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between"
                  >
                    <div>
                      {/* Product Card Image Container */}
                      <div className="h-28 bg-surface rounded-lg flex items-center justify-center mb-3 overflow-hidden relative">
                        {p.image ? (
                          <img
                            src={
                              /^https?:\/\//i.test(p.image)
                                ? p.image
                                : `${(
                                    import.meta.env.VITE_API_URL ||
                                    "http://localhost:8000/api"
                                  ).replace(/\/api\/?$/, "")}${p.image.startsWith("/") ? "" : "/"}${p.image}`
                            }
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <Package size={28} className="text-emerald/40" />
                        )}
                        <span className="absolute top-2 right-2 bg-ink text-white text-[9px] px-2 py-0.5 rounded-full">
                          {p.category || "EV"}
                        </span>
                      </div>

                      <p className="text-xs text-muted">
                        {p.model_number || "EV Model"}
                      </p>

                      <h3 className="font-display text-lg font-semibold text-ink mt-1">
                        {p.name}
                      </h3>

                      <p className="text-sm text-muted mt-2 line-clamp-2">
                        {p.description ||
                          "Premium EV product."}
                      </p>

                      {/* Vendor Price */}
                      <div className="mt-4 p-3 rounded-xl bg-emerald/5 border border-emerald/10">
                        <p className="text-[10px] text-muted uppercase tracking-wider">
                          Your Vendor Price
                        </p>

                        <p className="font-display text-xl font-bold text-emerald-dark">
                          ₹
                          {Number(
                            p.price || 0
                          ).toLocaleString(
                            "en-IN"
                          )}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() =>
                        setSelectedProduct(p)
                      }
                      className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-ink text-volt text-sm font-medium hover:opacity-90"
                    >
                      <Eye size={15} />
                      Product Details
                    </button>
                  </Card>
                );
              })}

              {products.length === 0 && (
                <div className="col-span-full text-center py-16 text-muted border border-dashed rounded-2xl">
                  No products available.
                </div>
              )}
            </div>
          )
        )}

        {/* Customers */}
        {tab === "customers" && !notApproved && (
          <Card className="p-5">
            <h3 className="font-display font-semibold mb-4">
              Add Customer
            </h3>

            <form
              className="grid md:grid-cols-2 gap-3"
              onSubmit={async (e) => {
                e.preventDefault();

                try {
                  await client.post(
                    "/vendor/customers/",
                    customerForm
                  );

                  setCustomerMsg(
                    "Customer added successfully"
                  );

                  setCustomerForm({
                    name: "",
                    mobile: "",
                    email: "",
                    city: "",
                    state: "",
                    pincode: "",
                    address: "",
                  });
                } catch (err) {
                  setCustomerMsg(
                    JSON.stringify(
                      err.response?.data ||
                        err.message
                    )
                  );
                }
              }}
            >
              <input
                required
                placeholder="Customer name"
                className="border rounded-lg p-2 text-sm"
                value={customerForm.name}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    name: e.target.value,
                  })
                }
              />

              <input
                required
                placeholder="Mobile"
                className="border rounded-lg p-2 text-sm"
                value={customerForm.mobile}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    mobile: e.target.value,
                  })
                }
              />

              <input
                placeholder="Email"
                className="border rounded-lg p-2 text-sm"
                value={customerForm.email}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    email: e.target.value,
                  })
                }
              />

              <input
                placeholder="City"
                className="border rounded-lg p-2 text-sm"
                value={customerForm.city}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    city: e.target.value,
                  })
                }
              />

              <input
                placeholder="State"
                className="border rounded-lg p-2 text-sm"
                value={customerForm.state}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    state: e.target.value,
                  })
                }
              />

              <input
                placeholder="Pincode"
                className="border rounded-lg p-2 text-sm"
                value={customerForm.pincode}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    pincode: e.target.value,
                  })
                }
              />

              <input
                placeholder="Address"
                className="border rounded-lg p-2 text-sm md:col-span-2"
                value={customerForm.address}
                onChange={(e) =>
                  setCustomerForm({
                    ...customerForm,
                    address: e.target.value,
                  })
                }
              />

              <button className="bg-ink text-volt rounded-lg px-4 py-2 text-sm font-medium w-fit">
                Add Customer
              </button>
            </form>

            {customerMsg && (
              <p className="text-sm text-muted mt-3">
                {customerMsg}
              </p>
            )}
          </Card>
        )}
      </div>

      {/* Product Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <p className="text-xs text-muted">
                  Product Details
                </p>

                <h2 className="font-display text-xl font-semibold text-ink">
                  {selectedProduct.name}
                </h2>
              </div>

              <button
                onClick={() =>
                  setSelectedProduct(null)
                }
                className="w-9 h-9 rounded-full bg-surface flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5">

              {/* Modal Image Container */}
              <div className="h-44 bg-surface rounded-lg flex items-center justify-center mb-5 overflow-hidden">
                {selectedProduct.image ? (
                  <img
                    src={
                      /^https?:\/\//i.test(selectedProduct.image)
                        ? selectedProduct.image
                        : `${(
                            import.meta.env.VITE_API_URL ||
                            "http://localhost:8000/api"
                          ).replace(/\/api\/?$/, "")}${selectedProduct.image.startsWith("/") ? "" : "/"}${selectedProduct.image}`
                    }
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <Package size={36} className="text-emerald/40" />
                )}
              </div>

              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3 text-sm mb-5">

                <div className="bg-surface rounded-lg p-3">
                  <p className="text-xs text-muted">
                    Model
                  </p>

                  <p className="font-medium">
                    {selectedProduct.model_number ||
                      "N/A"}
                  </p>
                </div>

                <div className="bg-surface rounded-lg p-3">
                  <p className="text-xs text-muted">
                    Category
                  </p>

                  <p className="font-medium">
                    {selectedProduct.category ||
                      "EV"}
                  </p>
                </div>

                <div className="bg-emerald/5 rounded-lg p-3 col-span-2">
                  <p className="text-xs text-muted">
                    Your Vendor Price
                  </p>

                  <p className="font-display text-2xl font-bold text-emerald-dark">
                    ₹
                    {Number(
                      selectedProduct.price || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="mb-5">
                <h3 className="font-semibold text-ink mb-2">
                  Description
                </h3>

                <p className="text-sm text-muted leading-6">
                  {selectedProduct.description ||
                    "No description available."}
                </p>
              </div>

              {/* Features */}
              {selectedProduct.features && (
                <div className="mb-5">
                  <h3 className="font-semibold text-ink mb-2">
                    Features
                  </h3>

                  <div className="space-y-2">
                    {selectedProduct.features
                      .split("\n")
                      .filter(Boolean)
                      .map((feature, index) => (
                        <div
                          key={index}
                          className="flex gap-2 text-sm"
                        >
                          <span className="text-emerald">
                            ✓
                          </span>

                          <span>
                            {feature}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Specifications */}
              {selectedProduct.specifications && (
                <div>
                  <h3 className="font-semibold text-ink mb-2">
                    Specifications
                  </h3>

                  <div className="bg-surface rounded-xl p-4 text-sm whitespace-pre-wrap text-muted">
                    {selectedProduct.specifications}
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">
          {label}
        </p>

        <Icon
          size={15}
          className="text-emerald"
        />
      </div>

      <p className="font-display text-xl font-semibold text-ink">
        {value}
      </p>
    </Card>
  );
}