import { useEffect, useState } from "react";
import client from "../api/client";
import {
  Card,
  PageHeader,
  StatusBadge,
  Button,
  Input,
  Select,
  Modal,
  FormGrid,
  Field,
} from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Products() {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [items, setItems] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [open, setOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const [msg, setMsg] = useState("");

  const blankProduct = {
    name: "",
    model_number: "",
    sku: "",
    category: "Scooter",
    description: "",
    base_price: "",
    tax_percent: 0,
    status: "ACTIVE",
    availability: true,
    specifications: "{}",
    features: "",
    image: null,
  };

  const blankPrice = {
    vendor: "",
    product: "",
    price: "",
  };

  const [form, setForm] = useState(blankProduct);
  const [price, setPrice] = useState(blankPrice);

  const load = () => {
    client
      .get("/products/")
      .then((r) => setItems(r.data.results || r.data))
      .catch((err) => console.error("Failed to load products:", err));
  };

  useEffect(() => {
    load();
    if (isAdmin) {
      client
        .get("/vendors/")
        .then((r) => setVendors(r.data.results || r.data))
        .catch((err) => console.error("Failed to load vendors:", err));
    }
  }, [isAdmin]);

  const handleOpenAddModal = () => {
    setMsg("");
    setForm(blankProduct);
    setOpen(true);
  };

  const handleOpenPriceModal = () => {
    setMsg("");
    setPrice(blankPrice);
    setPriceOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "specifications") {
          try {
            fd.append(k, JSON.stringify(JSON.parse(v || "{}")));
          } catch {
            fd.append(k, "{}");
          }
        } else if (v !== null && v !== undefined) {
          fd.append(k, v);
        }
      });

      await client.post("/products/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setOpen(false);
      setForm(blankProduct);
      load();
    } catch (e) {
      setMsg(
        typeof e.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : e.response?.data || e.message
      );
    }
  };

  const savePrice = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await client.post("/vendor-product-prices/", price);
      setPriceOpen(false);
      setPrice(blankPrice);
      setMsg("Vendor price saved successfully!");
    } catch (e) {
      setMsg(
        typeof e.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : e.response?.data || e.message
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products"
        subtitle="Admin catalog and vendor-specific pricing."
        action={
          isAdmin && (
            <div className="flex gap-2">
              <Button onClick={handleOpenPriceModal} variant="outline">
                Set Vendor Price
              </Button>
              <Button onClick={handleOpenAddModal}>+ Add Product</Button>
            </div>
          )
        }
      />

      {msg && (
        <div className="p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm">
          {msg}
        </div>
      )}

      {/* Products Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {items.map((p) => (
          <Card key={p.id} className="p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2">
                <p className="font-display font-semibold text-ink">{p.name}</p>
                <StatusBadge status={p.status} />
              </div>

              <p className="text-xs text-muted font-mono mt-1">
                {p.sku || "N/A"} · {p.model_number || "N/A"}
              </p>

              <p className="text-sm text-muted my-3 line-clamp-2">
                {p.description || "No description provided."}
              </p>
            </div>

            <p className="font-display text-lg font-semibold text-emerald-dark pt-2 border-t border-black/5">
              ₹{Number(p.base_price || 0).toLocaleString("en-IN")}
            </p>
          </Card>
        ))}

        {items.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted border border-dashed rounded-xl">
            No products available in the catalog.
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Add Product">
        <form onSubmit={save} className="space-y-4">
          <FormGrid>
            <Field label="Name">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Product Name"
              />
            </Field>

            <Field label="SKU">
              <Input
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                placeholder="e.g. SCT-001"
              />
            </Field>

            <Field label="Model">
              <Input
                value={form.model_number}
                onChange={(e) =>
                  setForm({ ...form, model_number: e.target.value })
                }
                placeholder="Model Number"
              />
            </Field>

            <Field label="Category">
              <Input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Scooter"
              />
            </Field>

            <Field label="Base Price">
              <Input
                required
                type="number"
                value={form.base_price}
                onChange={(e) =>
                  setForm({ ...form, base_price: e.target.value })
                }
                placeholder="0.00"
              />
            </Field>

            <Field label="Tax %">
              <Input
                type="number"
                value={form.tax_percent}
                onChange={(e) =>
                  setForm({ ...form, tax_percent: e.target.value })
                }
                placeholder="18"
              />
            </Field>
          </FormGrid>

          <Field label="Description">
            <textarea
              className="w-full border border-black/10 rounded-lg p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40"
              rows="3"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Write product description..."
            />
          </Field>

          <Field label="Product Image">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm({ ...form, image: e.target.files[0] || null })
              }
            />
          </Field>

          <Field label="Specifications (JSON)">
            <textarea
              className="w-full border border-black/10 rounded-lg p-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald/40"
              rows="3"
              value={form.specifications}
              onChange={(e) =>
                setForm({ ...form, specifications: e.target.value })
              }
              placeholder='{"range": "80km", "battery": "72V"}'
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
            <Button type="submit">Create Product</Button>
          </div>
        </form>
      </Modal>

      {/* Set Vendor-Specific Price Modal */}
      <Modal
        open={priceOpen}
        onClose={() => setPriceOpen(false)}
        title="Set Vendor-Specific Price"
      >
        <form onSubmit={savePrice} className="space-y-4">
          <Field label="Vendor">
            <Select
              required
              value={price.vendor}
              onChange={(e) => setPrice({ ...price, vendor: e.target.value })}
            >
              <option value="">Select vendor</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.business_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Product">
            <Select
              required
              value={price.product}
              onChange={(e) => setPrice({ ...price, product: e.target.value })}
            >
              <option value="">Select product</option>
              {items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Price">
            <Input
              required
              type="number"
              value={price.price}
              onChange={(e) => setPrice({ ...price, price: e.target.value })}
              placeholder="Custom Vendor Price"
            />
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPriceOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Price</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}