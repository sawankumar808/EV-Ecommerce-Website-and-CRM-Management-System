import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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

export default function CustomerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [form, setForm] = useState({});
  const [err, setErr] = useState("");

  const loadCustomer = () => {
    client
      .get(`/api/customers/${id}/`)
      .then((r) => {
        setCustomer(r.data);
        setForm(r.data);
      })
      .catch((e) => console.error("Failed to load customer details:", e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadCustomer();
    client
      .get("/api/vendors/")
      .then((r) => {
        const allVendors = r.data.results || r.data;
        const approvedVendors = allVendors.filter(
          (v) => v.status?.toUpperCase() === "APPROVED"
        );
        setVendors(approvedVendors);
      })
      .catch(() => {});
  }, [id]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      const payload = {
        ...form,
        vendor: form.vendor?.id || form.vendor || null,
      };
      const res = await client.put(`/api/customers/${id}/`, payload);
      setCustomer(res.data);
      setEditOpen(false);
      alert("Customer details updated successfully!");
    } catch (e) {
      setErr(
        typeof e.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : e.response?.data || e.message
      );
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this customer?")) return;
    try {
      await client.delete(`/api/customers/${id}/`);
      alert("Customer deleted successfully!");
      navigate("/crm/customers");
    } catch (e) {
      alert("Failed to delete customer.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading customer details...</div>;
  }

  if (!customer) {
    return <div className="p-8 text-center text-muted">Customer not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <PageHeader
          title={customer.name}
          subtitle={`Category: ${customer.category} · Mobile: ${customer.mobile}`}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate("/crm/customers")}>
            Back
          </Button>
          <Button variant="primary" onClick={() => setEditOpen(true)}>
            Edit Customer
          </Button>
          <Button variant="danger" onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
            Delete
          </Button>
        </div>
      </div>

      {err && (
        <div className="p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm">
          {err}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-display font-semibold text-ink border-b pb-2">Customer Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted">Email</p>
              <p className="font-medium text-ink mt-0.5">{customer.email || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Mobile</p>
              <p className="font-medium text-ink mt-0.5">{customer.mobile}</p>
            </div>
            <div>
              <p className="text-xs text-muted">City / State</p>
              <p className="font-medium text-ink mt-0.5">{customer.city || "—"}, {customer.state || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Pincode</p>
              <p className="font-medium text-ink mt-0.5">{customer.pincode || "—"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-muted">Address</p>
              <p className="font-medium text-ink mt-0.5">{customer.address || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted">Associated Vendor</p>
              <p className="font-medium text-ink mt-0.5">{customer.vendor_name || customer.vendor?.business_name || "—"}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-display font-semibold text-ink border-b pb-2">Purchases & Activity</h3>
          <p className="text-sm text-muted">No recent battery or scooter purchases recorded for this customer yet.</p>
        </Card>
      </div>

      {/* Edit Customer Modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Customer Details">
        <form onSubmit={handleUpdate} className="space-y-4">
          <FormGrid>
            <Field label="Name">
              <Input
                required
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>

            <Field label="Mobile">
              <Input
                required
                value={form.mobile || ""}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />
            </Field>

            <Field label="Email">
              <Input
                type="email"
                value={form.email || ""}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>

            <Field label="City">
              <Input
                value={form.city || ""}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </Field>

            <Field label="State">
              <Input
                value={form.state || ""}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
              />
            </Field>

            <Field label="Pincode">
              <Input
                value={form.pincode || ""}
                onChange={(e) => setForm({ ...form, pincode: e.target.value })}
              />
            </Field>

            <Field label="Category">
              <Select
                value={form.category || "RETAIL"}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="RETAIL">RETAIL</option>
                <option value="FLEET">FLEET</option>
                <option value="CORPORATE">CORPORATE</option>
              </Select>
            </Field>

            <Field label="Vendor">
              <Select
                value={form.vendor?.id || form.vendor || ""}
                onChange={(e) => setForm({ ...form, vendor: e.target.value })}
              >
                <option value="">None (Select Approved Vendor)</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.business_name || v.name} ({v.city || "N/A"})
                  </option>
                ))}
              </Select>
            </Field>
          </FormGrid>

          <Field label="Address">
            <Input
              value={form.address || ""}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}