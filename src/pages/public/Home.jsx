import { Link } from "react-router-dom";
import { BatteryCharging, ShieldCheck, Truck, QrCode, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import client from "../../api/client";

export default function Home() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    client.get("/public-products/").then((r) => setProducts((r.data.results || r.data).slice(0, 3))).catch(() => {});
  }, []);

  return (
    <div>
      <section className="bg-ink text-white relative overflow-hidden">
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-emerald/10 blur-3xl" />
        <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-volt/10 blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 py-24 relative z-10 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-volt bg-volt/10 px-3 py-1 rounded-full mb-5">
              <BatteryCharging size={13} /> Trusted by 200+ EV dealers across India
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-tight mb-5">
              Power your EV business with batteries built to last.
            </h1>
            <p className="text-white/60 text-base leading-relaxed mb-8 max-w-lg">
              Voltra supplies vendor-priced batteries and scooters with full batch traceability,
              QR-tracked lifecycle history, and warranty management — register as a vendor to unlock pricing.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/vendor/register" className="bg-volt text-ink font-medium px-5 py-3 rounded-lg flex items-center gap-2">
                Become a Vendor <ArrowRight size={16} />
              </Link>
              <Link to="/products" className="border border-white/20 text-white font-medium px-5 py-3 rounded-lg">
                Browse Products
              </Link>
            </div>
          </div>
          <div className="charge-bar h-4 lg:h-auto lg:self-stretch lg:w-3 lg:rounded-2xl rounded-full">
            <span className="lg:!h-[78%] lg:!w-full" style={{ width: "78%" }} />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 grid sm:grid-cols-3 gap-6">
        {[
          { icon: ShieldCheck, title: "Warranty Tracked", body: "Every battery's warranty window is recorded from installation date, per unit." },
          { icon: QrCode, title: "QR Traceability", body: "Scan any battery's QR code to pull up its full batch, warranty and lifecycle history." },
          { icon: Truck, title: "Vendor Pricing", body: "Approved vendors see their negotiated pricing the moment they log in." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-white rounded-xl2 shadow-card p-6 border border-black/[0.04]">
            <div className="w-10 h-10 rounded-lg bg-emerald/10 flex items-center justify-center mb-4">
              <Icon size={18} className="text-emerald-dark" />
            </div>
            <p className="font-display font-semibold text-ink mb-1">{title}</p>
            <p className="text-sm text-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </section>

      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-semibold text-ink">Featured Products</h2>
          <Link to="/products" className="text-sm font-medium text-emerald-dark flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link key={p.id} to={`/products/${p.id}`} className="bg-white rounded-xl2 shadow-card border border-black/[0.04] overflow-hidden group">
              <div className="h-40 bg-surface flex items-center justify-center">
                <BatteryCharging size={36} className="text-emerald/40" />
              </div>
              <div className="p-4">
                <p className="font-medium text-ink group-hover:text-emerald-dark transition-colors">{p.name}</p>
                <p className="text-xs text-muted mt-1">{p.model_number}</p>
                <p className="text-sm font-medium text-amber mt-3">Login to View Price</p>
              </div>
            </Link>
          ))}
          {products.length === 0 && (
            <p className="text-sm text-muted col-span-3">Products will appear here once added by the admin.</p>
          )}
        </div>
      </section>
    </div>
  );
}
