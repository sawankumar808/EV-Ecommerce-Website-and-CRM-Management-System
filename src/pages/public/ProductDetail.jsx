import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { BatteryCharging, Lock, CheckCircle2, ArrowLeft } from "lucide-react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    client.get(`/public-products/${id}/`).then((r) => setProduct(r.data)).catch(() => {});
  }, [id]);

  if (!product) return <div className="max-w-5xl mx-auto px-4 py-16 text-muted">Loading…</div>;

  const features = (product.features || "").split("\n").filter(Boolean);
  const specs = product.specifications || {};

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <Link to="/products" className="text-sm text-muted flex items-center gap-1.5 mb-6 hover:text-ink">
        <ArrowLeft size={14} /> Back to Products
      </Link>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="h-80 bg-white rounded-xl2 shadow-card border border-black/[0.04] flex items-center justify-center">
          {product.image ? (
            <img src={product.image} alt={product.name} className="h-full w-full object-cover rounded-xl2" />
          ) : (
            <BatteryCharging size={64} className="text-emerald/30" />
          )}
        </div>

        <div>
          <span className={`inline-block text-xs font-medium px-2.5 py-1 rounded-full mb-3 ${product.availability ? "bg-emerald/10 text-emerald-dark" : "bg-coral/10 text-coral"}`}>
            {product.availability ? "In Stock" : "Out of Stock"}
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink mb-1">{product.name}</h1>
          <p className="text-sm text-muted mb-5">{product.model_number} · {product.category}</p>

          {product.price ? (
            <p className="font-display text-3xl font-semibold text-emerald-dark mb-6">
              ₹{Number(product.price).toLocaleString("en-IN")}
            </p>
          ) : (
            <div className="bg-amber/10 text-amber rounded-lg px-4 py-3 flex items-center gap-2 mb-6 text-sm font-medium">
              <Lock size={15} /> {user ? "Only approved vendors can view pricing." : "Login as an approved vendor to view pricing."}
            </div>
          )}

          <p className="text-sm text-muted leading-relaxed mb-6">{product.description}</p>

          {features.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Features</p>
              <ul className="space-y-2">
                {features.map((f, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink">
                    <CheckCircle2 size={15} className="text-emerald mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {Object.keys(specs).length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Specifications</p>
              <div className="bg-white rounded-lg border border-black/[0.06] divide-y divide-black/[0.05]">
                {Object.entries(specs).map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5 text-sm">
                    <span className="text-muted">{k}</span>
                    <span className="text-ink font-medium">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!user && (
            <Link to="/vendor/register" className="inline-block mt-7 bg-ink text-volt font-medium px-5 py-2.5 rounded-lg">
              Register as a Vendor to Order
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
