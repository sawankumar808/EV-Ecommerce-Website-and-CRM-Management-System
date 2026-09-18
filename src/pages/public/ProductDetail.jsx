import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  BatteryCharging,
  CheckCircle2,
  ArrowLeft,
  ShoppingCart,
  X,
} from "lucide-react";

import client from "../../api/client";

function getImageUrl(img) {
  if (!img) return null;

  if (/^https?:\/\//i.test(img)) {
    return img;
  }

  const apiBase =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8000/api";

  const backendOrigin = apiBase.replace(/\/api\/?$/, "");

  return `${backendOrigin}${img.startsWith("/") ? "" : "/"}${img}`;
}

export default function ProductDetail() {
  const { id } = useParams();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Buy Now Modal States
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [visitorForm, setVisitorForm] = useState({
    name: "",
    mobile: "",
    address: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setLoading(true);

    client
      .get(`/api/products/${id}/`)
      .then((r) => {
        setProduct(r.data);
      })
      .catch((err) => {
        console.error("Failed to load product:", err);
        setProduct(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const handleBuySubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Normal visitor purchase / lead creation endpoint (Jo admin aur sales dash par alert/notification generate karega)
      await client.post("/api/orders/public_purchase/", {
        product: product.id,
        visitor_name: visitorForm.name,
        visitor_mobile: visitorForm.mobile,
        visitor_address: visitorForm.address,
        notes: visitorForm.notes,
        quantity: 1,
      }).catch(() => {
        // Fallback agar public order endpoint alag ho
        return client.post("/api/leads/", {
          name: visitorForm.name,
          mobile: visitorForm.mobile,
          address: visitorForm.address,
          requirements: `Direct Order/Inquiry for product: ${product.name} (SKU: ${product.sku})`,
          status: "NEW",
        });
      });

      setSuccessMsg("Order request placed successfully! Our sales team & admin have been notified with your product details.");
      setVisitorForm({ name: "", mobile: "", address: "", notes: "" });
      
      setTimeout(() => {
        setIsBuyModalOpen(false);
        setSuccessMsg("");
      }, 3000);
    } catch (err) {
      setErrorMsg("Failed to place order. Please try again or contact support.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-muted">
        Loading…
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <p className="text-coral mb-4">
          Product not found.
        </p>
        <Link
          to="/products"
          className="text-emerald-dark font-medium"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  const features = Array.isArray(product.features)
    ? product.features
    : String(product.features || "")
        .split("\n")
        .filter(Boolean);

  const specs = product.specifications || {};
  const imageUrl = getImageUrl(product.image);
  const publicPrice = product.public_price ?? product.price ?? 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      {/* BACK */}
      <Link
        to="/products"
        className="text-sm text-muted flex items-center gap-1.5 mb-6 hover:text-ink"
      >
        <ArrowLeft size={14} />
        Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        {/* PRODUCT IMAGE */}
        <div className="h-80 bg-white rounded-2xl shadow-sm border border-black/[0.04] flex items-center justify-center overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="h-full w-full object-contain p-4"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <BatteryCharging size={64} className="text-emerald/30" />
          )}
        </div>

        {/* PRODUCT INFORMATION */}
        <div>
          <span
            className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${
              product.availability
                ? "bg-emerald/10 text-emerald-dark"
                : "bg-coral/10 text-coral"
            }`}
          >
            {product.availability ? "In Stock" : "Out of Stock"}
          </span>

          <h1 className="font-display text-2xl font-semibold text-ink mb-1">
            {product.name}
          </h1>

          <p className="text-sm text-muted mb-5">
            {product.model_number || "N/A"} · {product.category || "EV"}
          </p>

          <div className="mb-6">
            <p className="text-xs text-muted uppercase tracking-wide mb-1">
              Visitor Price
            </p>
            <p className="font-display text-3xl font-semibold text-emerald-dark">
              ₹{Number(publicPrice).toLocaleString("en-IN")}
            </p>
          </div>

          <p className="text-sm text-muted leading-relaxed mb-6">
            {product.description || "No description available."}
          </p>

          {features.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Features
              </p>
              <ul className="space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-ink">
                    <CheckCircle2 size={15} className="text-emerald mt-0.5 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* CTA BUTTONS (Buy Now & Vendor Register) */}
          <div className="flex flex-wrap gap-3 mt-7">
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="flex items-center gap-2 bg-emerald text-white font-medium px-6 py-3 rounded-xl shadow hover:opacity-90 transition-opacity"
            >
              <ShoppingCart size={18} /> Buy Now
            </button>
            <Link
              to="/vendor/register"
              className="flex items-center gap-2 bg-ink text-volt font-medium px-5 py-3 rounded-xl"
            >
              Register as a Vendor
            </Link>
          </div>
        </div>
      </div>

      {/* BUY NOW POPUP MODAL FOR VISITORS */}
      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 relative shadow-2xl">
            <button
              onClick={() => setIsBuyModalOpen(false)}
              className="absolute top-4 right-4 text-muted hover:text-ink"
            >
              <X size={20} />
            </button>

            <h2 className="font-display text-xl font-semibold text-ink mb-1">
              Quick Purchase / Inquiry
            </h2>
            <p className="text-xs text-muted mb-4">
              Ordering: <span className="font-semibold text-ink">{product.name}</span> (₹{Number(publicPrice).toLocaleString("en-IN")})
            </p>

            <form onSubmit={handleBuySubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Your Full Name *</label>
                <input
                  required
                  className="w-full border rounded-lg p-2.5 text-sm"
                  placeholder="Rahul Sharma"
                  value={visitorForm.name}
                  onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Mobile Number *</label>
                <input
                  required
                  type="tel"
                  className="w-full border rounded-lg p-2.5 text-sm"
                  placeholder="9876543210"
                  value={visitorForm.mobile}
                  onChange={(e) => setVisitorForm({ ...visitorForm, mobile: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Delivery Address *</label>
                <textarea
                  required
                  rows={2}
                  className="w-full border rounded-lg p-2.5 text-sm"
                  placeholder="House no, Street, City, Pincode"
                  value={visitorForm.address}
                  onChange={(e) => setVisitorForm({ ...visitorForm, address: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Additional Notes (Optional)</label>
                <input
                  className="w-full border rounded-lg p-2.5 text-sm"
                  placeholder="Any specific instructions..."
                  value={visitorForm.notes}
                  onChange={(e) => setVisitorForm({ ...visitorForm, notes: e.target.value })}
                />
              </div>

              {successMsg && (
                <div className="p-3 bg-emerald/10 text-emerald-dark text-xs rounded-lg flex items-center gap-2">
                  <CheckCircle2 size={16} /> {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-coral/10 text-coral text-xs rounded-lg">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 bg-ink text-volt py-3 rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? "Submitting Order..." : "Confirm & Send to Sales Team"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}