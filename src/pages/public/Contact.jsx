import { useState } from "react";
import { Phone, Mail, MapPin, Send } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-16 grid md:grid-cols-2 gap-12">
      <div>
        <span className="text-xs font-medium text-emerald-dark uppercase tracking-wide">Contact Us</span>
        <h1 className="font-display text-3xl font-semibold text-ink mt-2 mb-5">Let's talk about your fleet.</h1>
        <p className="text-muted leading-relaxed mb-8">
          Questions about vendor onboarding, bulk pricing, or warranty claims? Reach out and our team
          will get back to you within one business day.
        </p>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center">
              <Phone size={16} className="text-emerald-dark" />
            </div>
            <span className="text-sm text-ink font-medium">+91 98765 43210</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center">
              <Mail size={16} className="text-emerald-dark" />
            </div>
            <span className="text-sm text-ink font-medium">vendors@voltramobility.com</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald/10 flex items-center justify-center">
              <MapPin size={16} className="text-emerald-dark" />
            </div>
            <span className="text-sm text-ink font-medium">Agra, Uttar Pradesh, India</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl2 shadow-card border border-black/[0.04] p-7">
        {sent ? (
          <p className="text-sm text-emerald-dark font-medium">Thanks — your message has been sent. We'll be in touch soon.</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-muted">Name</label>
              <input required className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Email</label>
              <input type="email" required className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted">Message</label>
              <textarea required rows={4} className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 text-sm" />
            </div>
            <button type="submit" className="w-full bg-ink text-volt font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
              <Send size={15} /> Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
