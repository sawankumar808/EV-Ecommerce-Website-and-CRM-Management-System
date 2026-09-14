import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import {
  Card,
  PageHeader,
  Button,
  Input,
  Modal,
  FormGrid,
  Field,
  Select,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Customers() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  const initialFormState = {
    name: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    category: "RETAIL",
    vendor: "",
  };

  const [form, setForm] = useState(initialFormState);

  const load = () => {
    client
      .get("/api/customers/")
      .then((r) => setItems(r.data.results || r.data))
      .catch((e) => console.error("Failed to load customers:", e));
  };

  useEffect(() => {
    load();
    client
      .get("/api/vendors/")
      .then((r) => {
        const allVendors = r.data.results || r.data;
        // FIX: Sirf APPROVED vendors ko filter karna
        const approvedVendors = allVendors.filter(
          (v) => v.status?.toUpperCase() === "APPROVED"
        );
        setVendors(approvedVendors);
      })
      .catch(() => {});
  }, []);

  const handleOpenModal = () => {
    setErr("");
    setForm(initialFormState);
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await client.post("/api/customers/", {
        ...form,
        vendor: form.vendor || null,
      });
      setOpen(false);
      setForm(initialFormState);
      load();
    } catch (e) {
      setErr(
        typeof e.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : e.response?.data || e.message
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        subtitle="Customer, purchase, battery and scooter records."
        action={<Button onClick={handleOpenModal}>+ Add Customer</Button>}
      />

      {err && (
        <div className="p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm mb-3">
          {err}
        </div>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
            <tr>
              {["Name", "Mobile", "City", "Category", "Vendor", "Actions"].map((x) => (
                <th key={x} className="text-left px-5 py-3 font-medium">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {items.map((c) => (
              <tr key={c.id} className="hover:bg-surface/50">
                <td className="px-5 py-3 font-medium">
                  <Link
                    className="text-ink hover:text-emerald-dark font-semibold transition-colors"
                    to={`/crm/customers/${c.id}`}
                  >
                    {c.name}
                  </Link>
                </td>
                <td className="px-5 py-3 text-muted">{c.mobile}</td>
                <td className="px-5 py-3 text-muted">{c.city || "—"}</td>
                <td className="px-5 py-3 text-muted">{c.category}</td>
                <td className="px-5 py-3 text-muted">{c.vendor_name || "—"}</td>
                <td className="px-5 py-3 text-right">
                  <Link
                    to={`/crm/customers/${c.id}`}
                    className="text-xs bg-surface border border-black/10 px-3 py-1.5 rounded-md hover:bg-black/5 transition-colors font-medium text-ink inline-block"
                  >
                    View Details
                  </Link>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-8 text-muted">
                  No customer records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={open} onClose={() => setOpen(false)} title="Add Customer">
        <form onSubmit={save} className="space-y-4">
          <FormGrid>
            <Field label="Name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Full Name"
              />
            </Field>

            <Field label="Mobile">
              <Input
                required
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                placeholder="Mobile Number"
              />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="email@example.com"
              />
            </Field>

            <Field label="City">
              <Input
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="City"
              />
            </Field>

            <Field label="State">
              <Input
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="State"
              />
            </Field>

            <Field label="Pincode">
              <Input
                value={form.pincode}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                placeholder="Pincode"
              />
            </Field>

            <Field label="Category">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="RETAIL">RETAIL</option>
                <option value="FLEET">FLEET</option>
                <option value="CORPORATE">CORPORATE</option>
              </Select>
            </Field>

            <Field label="Vendor">
              <Select
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              >
                <option value="">None (Select Vendor)</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.business_name || v.name || `Vendor #${v.id}`} ({v.city || "N/A"})
                  </option>
                ))}
              </Select>
            </Field>
          </FormGrid>

          <Field label="Address">
            <Input
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Full Address"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}