import { Zap, Target, Users } from "lucide-react";

export default function About() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <span className="text-xs font-medium text-emerald-dark uppercase tracking-wide">About Us</span>
      <h1 className="font-display text-3xl font-semibold text-ink mt-2 mb-5">
        Built to keep every EV battery accountable, from batch to installation.
      </h1>
      <p className="text-muted leading-relaxed mb-4">
        Voltra Mobility supplies EV batteries and scooters to dealers and fleet operators across India.
        We built our vendor network on one principle: every part we ship should be traceable — batch,
        QR code, warranty and lifecycle, all the way to the scooter it powers.
      </p>
      <p className="text-muted leading-relaxed mb-12">
        Our vendor portal gives approved partners direct access to pricing, stock, and their own customer
        and battery history — no calls, no spreadsheets, no guesswork.
      </p>

      <div className="grid sm:grid-cols-3 gap-6">
        {[
          { icon: Zap, title: "Our Mission", body: "Make EV battery supply chains transparent for every vendor we work with." },
          { icon: Target, title: "Our Focus", body: "Batch-wise quality control, QR-tracked lifecycle, and honest vendor pricing." },
          { icon: Users, title: "Our Network", body: "200+ approved vendors and growing, across retail, distribution and service centers." },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="bg-white rounded-xl2 shadow-card p-6 border border-black/[0.04]">
            <Icon size={20} className="text-emerald-dark mb-3" />
            <p className="font-display font-semibold text-ink mb-1">{title}</p>
            <p className="text-sm text-muted leading-relaxed">{body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
