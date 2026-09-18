import { useEffect, useState } from "react";
import client from "../api/client";
import {
  Card,
  PageHeader,
  StatusBadge,
  Button,
  Input,
  Modal,
  FormGrid,
  Field,
  Select,
} from "../components/ui";

export default function Sales() {
  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState("");

  const initialFormState = {
    sale_number: "",
    vendor: "",
    customer: "",
    product: "",
    quantity: 1,
    amount: "",
    status: "CONFIRMED",
    notes: "",
  };

  const [form, setForm] = useState(initialFormState);

  const load = () => {
    client
      .get("/sales/")
      .then((r) => {
        const data = r.data;
        const list = Array.isArray(data) ? data : (data.results || data.data || []);
        setItems(list);
      })
      .catch((e) => {
        console.error("Failed to load sales:", e);
        setItems([]);
      });
  };

  useEffect(() => {
    load();
    Promise.all([
      client.get("/vendors/"),
      client.get("/customers/"),
      client.get("/products/"),
    ])
      .then(([v, c, p]) => {
        const vData = v.data;
        const cData = c.data;
        const pData = p.data;

        setVendors(Array.isArray(vData) ? vData : (vData.results || vData.data || []));
        setCustomers(Array.isArray(cData) ? cData : (cData.results || cData.data || []));
        setProducts(Array.isArray(pData) ? pData : (pData.results || pData.data || []));
      })
      .catch((e) => {
        console.error("Failed to load initial dropdown data:", e);
        setVendors([]);
        setCustomers([]);
        setProducts([]);
      });
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
      await client.post("/sales/", {
        ...form,
        vendor: form.vendor || null,
        customer: form.customer || null,
        product: form.product || null,
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

  const safeItems = Array.isArray(items) ? items : [];
  const safeVendors = Array.isArray(vendors) ? vendors : [];
  const safeCustomers = Array.isArray(customers) ? customers : [];
  const safeProducts = Array.isArray(products) ? products : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales CRM"
        subtitle="Sales, orders, vendors, customers and sales history."
        action={<Button onClick={handleOpenModal}>+ New Sale</Button>}
      />

      {err && (
        <div className="p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm">
          {err}
        </div>
      )}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
            <tr>
              {[
                "Sale #",
                "Vendor",
                "Customer",
                "Product",
                "Amount",
                "Salesperson",
                "Date",
                "Status",
              ].map((x) => (
                <th key={x} className="text-left px-4 py-3 font-medium">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {safeItems.map((s) => (
              <tr key={s.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-mono font-semibold text-ink">
                  {s.sale_number}
                </td>
                <td className="px-4 py-3 text-muted">{s.vendor_name || "—"}</td>
                <td className="px-4 py-3 text-muted">{s.customer_name || "—"}</td>
                <td className="px-4 py-3 text-muted">{s.product_name || "—"}</td>
                <td className="px-4 py-3 font-medium text-ink">
                  ₹{Number(s.amount || 0).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3 text-muted">
                  {s.salesperson_name || "—"}
                </td>
                <td className="px-4 py-3 text-muted">{s.sale_date || "—"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
            {safeItems.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted">
                  No sales records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Modal for New Sale */}
      <Modal open={open} onClose={() => setOpen(false)} title="Create Sale / Order">
        <form onSubmit={save} className="space-y-4">
          <FormGrid>
            <Field label="Sale / Order Number">
              <Input
                required
                value={form.sale_number}
                onChange={(e) =>
                  setForm({ ...form, sale_number: e.target.value })
                }
                placeholder="e.g. INV-2026-001"
              />
            </Field>

            <Field label="Vendor">
              <Select
                value={form.vendor}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              >
                <option value="">Select Vendor</option>
                {safeVendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.business_name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Customer">
              <Select
                value={form.customer}
                onChange={(e) => setForm({ ...form, customer: e.target.value })}
              >
                <option value="">Select Customer</option>
                {safeCustomers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.first_name || `Customer #${c.id}`}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Product">
              <Select
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
              >
                <option value="">Select Product</option>
                {safeProducts.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Quantity">
              <Input
                type="number"
                min="1"
                value={form.quantity}
                onChange={(e) =>
                  setForm({ ...form, quantity: e.target.value })
                }
              />
            </Field>

            <Field label="Amount">
              <Input
                required
                type="number"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                placeholder="0.00"
              />
            </Field>

            <Field label="Status">
              <Select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="PAID">PAID</option>
                <option value="DRAFT">DRAFT</option>
                <option value="CANCELLED">CANCELLED</option>
              </Select>
            </Field>
          </FormGrid>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Sale</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}