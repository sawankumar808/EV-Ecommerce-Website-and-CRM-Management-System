import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Zap, CheckCircle2, Upload } from "lucide-react";
import client from "../api/client";

const empty = {
  business_name: "", contact_person: "", mobile_number: "", email: "",
  address: "", city: "", state: "", pincode: "", gst_number: "", pan_number: "",
  business_type: "RETAILER", username: "", password: "", assigned_salesperson: "",
};

export default function VendorRegister() {
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState({ gst_cert: null, pan_card: null, address_proof: null });
  const [salesPersons, setSalesPersons] = useState([]);
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load Salespersons for dropdown selection
    async function loadSalesTeam() {
      try {
        const res = await client.get("/users/?role=SALES");
        setSalesPersons(res.data.results || res.data);
      } catch {
        setSalesPersons([]);
      }
    }
    loadSalesTeam();
  }, []);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleFileChange(key, e) {
    if (e.target.files && e.target.files[0]) {
      setFiles((f) => ({ ...f, [key]: e.target.files[0] }));
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    // Build FormData to upload both JSON text fields and PDF/Image documents
    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      formData.append(key, form[key]);
    });

    if (files.gst_cert) formData.append("gst_document", files.gst_cert);
    if (files.pan_card) formData.append("pan_document", files.pan_card);
    if (files.address_proof) formData.append("address_document", files.address_proof);

    try {
      await client.post("/vendor/register/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDone(true);
    } catch (err) {
      setErrors(err.response?.data || { detail: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-6">
        <div className="max-w-md text-center">
          <div className="w-14 h-14 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 size={28} className="text-emerald" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink mb-2">Registration submitted</h1>
          <p className="text-sm text-muted mb-6">
            Thanks for registering, {form.contact_person.split(" ")[0]}. Your application is now
            <span className="font-medium text-amber"> Pending Review</span>. You'll be able to log in
            and see product prices as soon as our CRM Admin approves your account.
          </p>
          <Link to="/login" className="inline-block bg-ink text-volt font-medium px-5 py-2.5 rounded-lg">
            Go to Vendor Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-ink flex items-center justify-center">
            <Zap size={18} className="text-volt" strokeWidth={2.5} />
          </div>
          <p className="font-display font-semibold tracking-wide text-ink">VOLTRA CRM</p>
        </div>

        <div className="bg-white rounded-xl2 shadow-card border border-black/[0.04] p-8">
          <h1 className="font-display text-2xl font-semibold text-ink mb-1">Vendor Registration</h1>
          <p className="text-sm text-muted mb-6">
            Register your business to unlock vendor pricing. Our team reviews every application before approval.
          </p>

          {errors.detail && <p className="text-coral text-sm mb-4">{errors.detail}</p>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Business Details</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Business / Vendor Name" value={form.business_name} onChange={(v) => update("business_name", v)} error={errors.business_name} required />
                <Field label="Contact Person" value={form.contact_person} onChange={(v) => update("contact_person", v)} error={errors.contact_person} required />
                <Field label="Mobile Number" value={form.mobile_number} onChange={(v) => update("mobile_number", v)} error={errors.mobile_number} required />
                <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} error={errors.email} required />
                
                <div>
                  <label className="text-xs font-medium text-muted">Business Type</label>
                  <select
                    value={form.business_type}
                    onChange={(e) => update("business_type", e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 text-sm bg-white"
                  >
                    <option value="RETAILER">Retailer</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                    <option value="DEALER">Dealer</option>
                    <option value="SERVICE_CENTER">Service Center</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted">Assign Sales Person (Optional)</label>
                  <select
                    value={form.assigned_salesperson}
                    onChange={(e) => update("assigned_salesperson", e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-black/10 text-sm bg-white"
                  >
                    <option value="">None / Unassigned</option>
                    {salesPersons.map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.first_name ? `${sp.first_name} ${sp.last_name}` : sp.username}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Address</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Address" value={form.address} onChange={(v) => update("address", v)} error={errors.address} required className="sm:col-span-2" />
                <Field label="City" value={form.city} onChange={(v) => update("city", v)} error={errors.city} required />
                <Field label="State" value={form.state} onChange={(v) => update("state", v)} error={errors.state} required />
                <Field label="Pincode" value={form.pincode} onChange={(v) => update("pincode", v)} error={errors.pincode} required />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Business Tax Identification & Documents</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <Field label="GST Number" value={form.gst_number} onChange={(v) => update("gst_number", v)} error={errors.gst_number} />
                <Field label="PAN Number" value={form.pan_number} onChange={(v) => update("pan_number", v)} error={errors.pan_number} />
              </div>

              <div className="space-y-3">
                <FileInput label="GST Certificate (PDF/Image)" onChange={(e) => handleFileChange("gst_cert", e)} filename={files.gst_cert?.name} />
                <FileInput label="PAN Card (PDF/Image)" onChange={(e) => handleFileChange("pan_card", e)} filename={files.pan_card?.name} />
                <FileInput label="Address Proof (PDF/Image)" onChange={(e) => handleFileChange("address_proof", e)} filename={files.address_proof?.name} />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">Login Credentials</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Choose a Username" value={form.username} onChange={(v) => update("username", v)} error={errors.username} required />
                <Field label="Choose a Password" type="password" value={form.password} onChange={(v) => update("password", v)} error={errors.password} required />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-ink text-volt font-medium py-2.5 rounded-lg hover:bg-ink-soft transition-colors disabled:opacity-60"
            >
              {loading ? "Submitting Registration..." : "Submit Registration"}
            </button>

            <p className="text-xs text-muted text-center">
              Already have an approved account? <Link to="/login" className="text-emerald font-medium">Login here</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, error, type = "text", required, className = "" }) {
  return (
    <div className={className}>
      <label className="text-xs font-medium text-muted">{label}{required && <span className="text-coral"> *</span>}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className={`w-full mt-1 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30 ${error ? "border-coral" : "border-black/10"}`}
      />
      {error && <p className="text-coral text-xs mt-1">{Array.isArray(error) ? error[0] : error}</p>}
    </div>
  );
}

function FileInput({ label, onChange, filename }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted block mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <label className="cursor-pointer flex items-center gap-2 px-3 py-1.5 border border-black/10 rounded-lg text-xs bg-surface hover:bg-black/5 font-medium">
          <Upload size={14} />
          <span>Upload File</span>
          <input type="file" onChange={onChange} className="hidden" accept="image/*,.pdf" />
        </label>
        <span className="text-xs text-muted truncate">{filename || "No file chosen"}</span>
      </div>
    </div>
  );
}