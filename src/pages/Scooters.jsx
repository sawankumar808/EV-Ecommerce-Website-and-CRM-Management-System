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

export default function Scooters() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [batteries, setBatteries] = useState([]);
  const [open, setOpen] = useState(false);
  const [assign, setAssign] = useState(null);
  const [err, setErr] = useState("");

  const initialFormState = {
    scooter_id: "",
    registration_number: "",
    brand: "",
    model: "",
    chassis_number: "",
    motor_number: "",
    customer: "",
    vendor: "",
    purchase_date: "",
    status: "IN_STOCK",
    remarks: "",
  };

  const [form, setForm] = useState(initialFormState);

  const fetchDropdowns = () => {
    Promise.all([
      client.get("/customers/"),
      client.get("/vendors/"),
      client.get("/batteries/?status=IN_STOCK"),
    ])
      .then(([c, v, b]) => {
        setCustomers(c.data.results || c.data);
        setVendors(v.data.results || v.data);
        setBatteries(b.data.results || b.data);
      })
      .catch((e) => console.error("Failed to load dropdown data:", e));
  };

  const load = () => {
    client
      .get("/scooters/")
      .then((r) => setItems(r.data.results || r.data))
      .catch((e) => console.error("Failed to load scooters:", e));
    
    fetchDropdowns();
  };

  useEffect(() => {
    load();
  }, []);

  const handleOpenAddModal = () => {
    setErr("");
    setForm(initialFormState);
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await client.post("/scooters/", {
        ...form,
        customer: form.customer || null,
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

  const doAssign = async (e) => {
    e.preventDefault();
    setErr("");
    
    if (!assign?.battery) {
      setErr("Please select a battery.");
      return;
    }

    try {
      await client.post(`/scooters/${assign.id}/assign_battery/`, {
        battery_id: Number(assign.battery),
      });
      setAssign(null);
      load(); // Scooter list + Available batteries list update hongi
    } catch (e) {
      setErr(
        typeof e.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : e.response?.data?.error || e.message
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Scooter Management"
        subtitle="Scooter creation, battery installation and replacement history."
        action={<Button onClick={handleOpenAddModal}>+ Add Scooter</Button>}
      />

      {err && (
        <div className="p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm">
          {err}
        </div>
      )}

      {/* Scooters List Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
            <tr>
              {[
                "Scooter ID",
                "Reg. Number",
                "Brand / Model",
                "Customer",
                "Vendor",
                "Installed Battery",
                "Status",
                "Action",
              ].map((x) => (
                <th key={x} className="text-left px-4 py-3 font-medium">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {items.map((s) => (
              <tr key={s.id} className="hover:bg-surface/50">
                <td className="px-4 py-3 font-mono font-semibold text-ink">
                  {s.scooter_id}
                </td>
                <td className="px-4 py-3 text-muted">
                  {s.registration_number || "—"}
                </td>
                <td className="px-4 py-3 text-ink font-medium">
                  {s.brand} {s.model}
                </td>
                <td className="px-4 py-3 text-muted">
                  {s.customer_name || "—"}
                </td>
                <td className="px-4 py-3 text-muted">
                  {s.vendor_name || "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-600">
                  {s.installed_battery || "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
                <td className="px-4 py-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setErr("");
                      setAssign({ ...s, battery: "" });
                    }}
                  >
                    {s.installed_battery ? "Replace Battery" : "Assign Battery"}
                  </Button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-8 text-muted">
                  No scooters found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Add Scooter Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Scooter">
        <form onSubmit={save} className="space-y-4">
          <FormGrid>
            {[
              ["Scooter ID", "scooter_id"],
              ["Registration Number", "registration_number"],
              ["Brand", "brand"],
              ["Model", "model"],
              ["Chassis Number", "chassis_number"],
              ["Motor Number", "motor_number"],
              ["Purchase Date", "purchase_date"],
            ].map(([label, key]) => (
              <Field key={key} label={label}>
                <Input
                  required={[
                    "scooter_id",
                    "brand",
                    "model",
                    "chassis_number",
                  ].includes(key)}
                  type={key === "purchase_date" ? "date" : "text"}
                  value={form[key]}
                  onChange={(e) =>
                    setForm({ ...form, [key]: e.target.value })
                  }
                  placeholder={label}
                />
              </Field>
            ))}

            <Field label="Customer">
              <Select
                value={form.customer}
                onChange={(e) =>
                  setForm({ ...form, customer: e.target.value })
                }
              >
                <option value="">None</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.first_name || `Customer #${c.id}`}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Vendor">
              <Select
                value={form.vendor}
                onChange={(e) =>
                  setForm({ ...form, vendor: e.target.value })
                }
              >
                <option value="">None</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.business_name}
                  </option>
                ))}
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
            <Button type="submit">Create Scooter</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Battery Modal */}
      <Modal
        open={!!assign}
        onClose={() => setAssign(null)}
        title="Assign / Replace Battery"
      >
        <form onSubmit={doAssign} className="space-y-4">
          <Field label="Battery">
            <Select
              required
              value={assign?.battery || ""}
              onChange={(e) =>
                setAssign({ ...assign, battery: e.target.value })
              }
            >
              <option value="">Select battery</option>
              {batteries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.battery_id} · {b.serial_number}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAssign(null)}
            >
              Cancel
            </Button>
            <Button type="submit">Install Battery</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}