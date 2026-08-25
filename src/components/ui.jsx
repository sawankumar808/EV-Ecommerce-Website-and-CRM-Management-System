export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl shadow-card border border-black/[0.04] ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">{title}</h1>
        {subtitle && <p className="text-sm text-muted mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

const statusColors = {
  APPROVED: "bg-emerald/10 text-emerald-dark",
  PENDING: "bg-amber/10 text-amber",
  UNDER_REVIEW: "bg-amber/10 text-amber",
  REJECTED: "bg-coral/10 text-coral",
  SUSPENDED: "bg-coral/10 text-coral",
  INACTIVE: "bg-black/5 text-muted",
  ACTIVE: "bg-emerald/10 text-emerald-dark",
  USED: "bg-black/5 text-muted",
  EXPIRED: "bg-coral/10 text-coral",
  DISABLED: "bg-black/5 text-muted",
  IN_STOCK: "bg-emerald/10 text-emerald-dark",
  SOLD: "bg-black/5 text-muted",
  INSTALLED: "bg-emerald/10 text-emerald-dark",
  DAMAGED: "bg-coral/10 text-coral",
  ADDED: "bg-amber/10 text-amber",
  ASSIGNED_VENDOR: "bg-amber/10 text-amber",
  ASSIGNED_CUSTOMER: "bg-amber/10 text-amber",
  RETURNED: "bg-coral/10 text-coral",
  IN_SERVICE: "bg-amber/10 text-amber",
  REPLACED: "bg-black/5 text-muted",
  DRAFT: "bg-black/5 text-muted",
  SENT: "bg-amber/10 text-amber",
  ACCEPTED: "bg-emerald/10 text-emerald-dark",
};

export function StatusBadge({ status }) {
  const cls = statusColors[status] || "bg-black/5 text-muted";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${cls}`}>
      {status?.replaceAll("_", " ")}
    </span>
  );
}

export function KpiCard({ label, value, pct, icon: Icon }) {
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-medium text-muted uppercase tracking-wide">{label}</p>
        {Icon && <Icon size={16} className="text-emerald" />}
      </div>
      <p className="font-display text-2xl font-semibold text-ink">{value}</p>
      {pct !== undefined && (
        <div className="charge-bar mt-3">
          <span style={{ width: `${Math.min(100, pct)}%` }} />
        </div>
      )}
    </Card>
  );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors";
  const variants = {
    primary: "bg-ink text-volt hover:bg-ink-soft",
    outline: "border border-black/10 text-ink hover:bg-black/[0.03]",
    ghost: "text-muted hover:text-ink hover:bg-black/[0.03]",
    danger: "bg-coral/10 text-coral hover:bg-coral/20",
  };
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Input(props) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald ${props.className || ""}`}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className={`w-full px-3 py-2 rounded-lg border border-black/10 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald/40 focus:border-emerald ${props.className || ""}`}
    >
      {children}
    </select>
  );
}

export function Field({ label, children, error }) {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-medium text-muted">
          {label}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-coral">{error}</p>}
    </div>
  );
}

export function FormGrid({ children, cols = 2 }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${cols} gap-4`}>
      {children}
    </div>
  );
}

export function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl border border-black/10">
        <div className="flex items-center justify-between mb-4 border-b border-black/5 pb-3">
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          <button
            onClick={onClose}
            type="button"
            className="text-muted hover:text-ink text-xl leading-none"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}