import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BatteryCharging, Lock, Search } from "lucide-react";
import client from "../../api/client";
import { useAuth } from "../../context/AuthContext";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  async function load() {
    const params = search ? { search } : {};
    const res = await client.get("/public-products/", { params });
    setProducts(res.data.results || res.data);
  }

  useEffect(() => { load(); }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-14">
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink">Products</h1>
          <p className="text-sm text-muted mt-1">
            {user?.role === "VENDOR" ? "Your vendor pricing is shown below." : "Login as an approved vendor to view pricing."}
          </p>
        </div>
        <div className="relative w-72 max-w-full">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search products..."
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-black/10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald/30"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((p) => (
          <Link key={p.id} to={`/products/${p.id}`} className="bg-white rounded-xl2 shadow-card border border-black/[0.04] overflow-hidden group">
            <div className="h-44 bg-surface flex items-center justify-center">
              {p.image ? (
                <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <BatteryCharging size={40} className="text-emerald/40" />
              )}
            </div>
            <div className="p-4">
              <p className="font-medium text-ink group-hover:text-emerald-dark transition-colors">{p.name}</p>
              <p className="text-xs text-muted mt-1">{p.model_number} · {p.category}</p>
              <div className="mt-3">
                {p.price ? (
                  <p className="font-display text-lg font-semibold text-emerald-dark">₹{Number(p.price).toLocaleString("en-IN")}</p>
                ) : (
                  <p className="text-sm font-medium text-amber flex items-center gap-1.5">
                    <Lock size={13} /> Login to View Price
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
        {products.length === 0 && <p className="text-sm text-muted col-span-3">No products available yet.</p>}
      </div>
    </div>
  );
}
