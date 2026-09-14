import { Link } from "react-router-dom";
import {
  BatteryCharging,
  ShieldCheck,
  Truck,
  QrCode,
  ArrowRight,
  Zap,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";
import client from "../../api/client";

function getImageUrl(img) {
  if (!img) return null;
  if (/^https?:\/\//i.test(img)) return img;
  const apiBase = import.meta.env.VITE_API_URL || "https://ev-ecommerce-website-and-crm-management.onrender.com/api";
  const backendOrigin = apiBase.replace(/\/api\/?$/, "");
  return `${backendOrigin}${img.startsWith("/") ? "" : "/"}${img}`;
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [heroImg, setHeroImg] = useState("https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=1000");

  useEffect(() => {
    const saved = localStorage.getItem("voltra_site_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.homeHeroImage) setHeroImg(parsed.homeHeroImage);
      } catch (e) {}
    }

    client
      .get("/api/public-products/")
      .then((r) => {
        const data = r.data.results || r.data;
        setProducts(data.slice(0, 3));
      })
      .catch((err) => {
        console.error("Failed to load products:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* HERO SECTION */}
      <section className="bg-ink text-white relative overflow-hidden">
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-emerald/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-volt/10 blur-3xl" />

        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-volt bg-volt/10 px-3.5 py-1.5 rounded-full">
              <Sparkles size={14} />
              Trusted by 200+ EV dealers across India
            </span>

            <h1 className="font-display text-4xl sm:text-6xl font-extrabold leading-tight tracking-tight">
              Power your EV business with high-performance scooters & batteries.
            </h1>

            <p className="text-white/70 text-base lg:text-lg leading-relaxed max-w-lg">
              Voltra supplies next-gen electric scooters and batteries with full batch traceability, QR-tracked lifecycle history, and smart warranty management.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                to="/vendor/register"
                className="bg-volt text-ink font-semibold px-6 py-3.5 rounded-xl flex items-center gap-2 hover:opacity-90 transition-all shadow-lg"
              >
                Become a Vendor
                <ArrowRight size={18} />
              </Link>

              <Link
                to="/products"
                className="border border-white/20 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-white/5 transition-all"
              >
                Browse Products
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-volt">180+ km</p>
                <p className="text-xs text-white/50 mt-1">Max Range</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-volt">100%</p>
                <p className="text-xs text-white/50 mt-1">QR Traceability</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-volt">24/7</p>
                <p className="text-xs text-white/50 mt-1">Dealer Support</p>
              </div>
            </div>
          </div>

          {/* Dynamic Hero Scooter Visual */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-volt/20 to-emerald/20 rounded-3xl blur-2xl"></div>
            <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-surface/10 aspect-[4/3]">
              <img
                src={heroImg}
                alt="Voltra EV Fleet"
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-ink/80 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center justify-between text-white">
                <div>
                  <p className="text-[10px] text-volt uppercase tracking-wider font-semibold">Flagship Edition</p>
                  <p className="text-sm font-bold">Voltra Pro Max Fleet Scooter</p>
                </div>
                <span className="px-3 py-1 bg-volt text-ink text-xs font-bold rounded-lg">New</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20 grid sm:grid-cols-3 gap-8">
        {[
          {
            icon: ShieldCheck,
            title: "Warranty Tracked",
            body: "Every battery and scooter warranty window is recorded from installation date, per unit.",
          },
          {
            icon: QrCode,
            title: "QR Traceability",
            body: "Scan any unit's QR code to pull up its full batch, warranty and lifecycle history instantly.",
          },
          {
            icon: Truck,
            title: "Vendor Pricing",
            body: "Approved vendors see their negotiated wholesale pricing seamlessly after logging in.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-white rounded-2xl shadow-sm p-8 border border-black/5 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5">
              <Icon size={22} />
            </div>
            <p className="font-display font-bold text-lg text-ink mb-2">{title}</p>
            <p className="text-sm text-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="font-display text-3xl font-bold text-ink">Featured Products</h2>
            <p className="text-muted text-sm mt-1">High-performance batteries and electric vehicles.</p>
          </div>
          <Link
            to="/products"
            className="text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-xl transition-colors"
          >
            View all products <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-3 gap-8">
          {products.map((p) => {
            const imgUrl = getImageUrl(p.image);
            return (
              <Link
                key={p.id}
                to={`/products/${p.id}`}
                className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden group hover:shadow-xl transition-all flex flex-col justify-between"
              >
                <div className="h-52 bg-gray-50 flex items-center justify-center overflow-hidden relative">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={p.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  ) : (
                    <BatteryCharging size={40} className="text-emerald-600/40" />
                  )}
                  <span className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2.5 py-1 rounded-lg text-xs font-semibold text-ink shadow-sm">
                    {p.model_number || "EV Series"}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-bold text-lg text-ink group-hover:text-emerald-600 transition-colors">{p.name}</h3>
                  <div className="flex items-center justify-between pt-2 border-t border-black/5">
                    <div>
                      <p className="text-xs text-muted">Visitor Price</p>
                      <p className="text-xl font-extrabold text-ink mt-0.5">
                        ₹{Number(p.public_price ?? p.price ?? 0).toLocaleString("en-IN")}
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      View Details
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}

          {products.length === 0 && (
            <p className="text-sm text-muted col-span-3 text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-black/10">
              Products will appear here once added by the admin.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}