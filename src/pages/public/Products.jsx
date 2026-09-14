import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../../api/client";
import { Package, Eye, ArrowRight, Zap } from "lucide-react";

export default function PublicProducts() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    client.get("/api/public-products/")
      .then((res) => setProducts(res.data.results || res.data))
      .catch((err) => console.error("Failed to load public products:", err));
  }, []);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (/^https?:\/\//i.test(img)) return img;
    const base = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
    return `${base.replace(/\/api\/?$/, "")}${img.startsWith("/") ? "" : "/"}${img}`;
  };

  return (
    <div className="min-h-screen bg-surface py-12 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-volt/20 text-ink mb-3">
            <Zap size={13} /> VOLTRA FLEET LINEUP
          </span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-ink">Explore Our Electric Vehicles</h1>
          <p className="text-sm text-muted mt-2 max-w-xl mx-auto">Discover high-performance EV scooters and cutting-edge battery technology designed for modern fleets.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl overflow-hidden border border-black/[0.06] hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col justify-between">
              <div>
                <div className="h-52 bg-surface-soft relative flex items-center justify-center overflow-hidden">
                  {p.image ? (
                    <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  ) : (
                    <Package size={40} className="text-emerald/30" />
                  )}
                  <span className="absolute top-3 right-3 bg-ink text-white text-[10px] px-3 py-1 rounded-full uppercase tracking-wider">
                    {p.category || "EV"}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-xs text-muted font-medium tracking-wide">{p.model_number || "EV Series"}</p>
                  <h3 className="font-display text-xl font-semibold text-ink mt-1">{p.name}</h3>
                  <p className="text-sm text-muted mt-2 line-clamp-2">{p.description || "Engineered for superior mileage and durability."}</p>
                  
                  <div className="mt-4 pt-4 border-t border-black/5 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase text-muted tracking-wide block">Starting Price</span>
                      <span className="font-display text-2xl font-bold text-ink">₹{Number(p.public_price || p.price || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Public visitor ke liye sirf View Details ka option */}
              <div className="p-6 pt-0">
                <Link to={`/products/${p.id}`} className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-ink text-volt text-sm font-medium hover:opacity-90 transition-opacity">
                  <Eye size={16} /> View Details
                </Link>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-black/10">
            <p className="text-muted text-sm">No electric vehicles available in the catalog right now. Check back soon!</p>
          </div>
        )}
      </div>
    </div>
  );
}