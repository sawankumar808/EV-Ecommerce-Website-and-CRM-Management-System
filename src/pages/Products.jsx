import { useEffect, useState } from "react";
import client from "../api/client";
import { Card } from "../components/ui";
import { Package, Eye, Edit, Trash2, Plus, X } from "lucide-react";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    sku: "",
    model_number: "",
    category: "SCOOTER",
    description: "",
    specifications: "",
    features: "",
    public_price: "",
    vendor_price: "",
    availability: true,
    status: "ACTIVE",
    image: null,
  });

  const fetchProducts = () => {
    client.get("/products/")
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data) ? data : (data.results || data.data || []);
        setProducts(list);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setProducts([]);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await client.delete(`/products/${id}/`);
        fetchProducts();
      } catch (err) {
        alert("Failed to delete product.");
      }
    }
  };

  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === "object") {
      try {
        return URL.createObjectURL(img);
      } catch (e) {
        return null;
      }
    }
    if (typeof img === "string") {
      if (/^https?:\/\//i.test(img)) return img;
      const cleanImg = img.startsWith("/") ? img : `/${img}`;
      const finalPath = cleanImg.startsWith("/media/") ? cleanImg : `/media${cleanImg}`;
      return `http://localhost:8000${finalPath}`;
    }
    return null;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("name", form.name || "");
    formData.append("sku", form.sku || `SKU-${Date.now()}`);
    formData.append("model_number", form.model_number || "");
    formData.append("category", form.category || "SCOOTER");
    formData.append("description", form.description || "");
    formData.append("specifications", form.specifications || "");
    formData.append("features", form.features || "");
    formData.append("public_price", form.public_price ? Number(form.public_price) : 0);
    formData.append("vendor_price", form.vendor_price ? Number(form.vendor_price) : 0);
    formData.append("availability", form.availability !== undefined ? form.availability : true);
    formData.append("status", form.status || "ACTIVE");
    
    if (form.image instanceof File) {
      formData.append("image", form.image);
    }

    try {
      if (form.id) {
        await client.put(`/products/${form.id}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await client.post("/products/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      setIsEditing(false);
      fetchProducts();
      alert("Product saved successfully!");
    } catch (err) {
      console.error("Save product error details:", err.response?.data);
      const errorData = err.response?.data;
      let errorMsg = "Failed to save product.";
      
      if (errorData) {
        if (typeof errorData === "object") {
          errorMsg = Object.entries(errorData)
            .map(([field, msg]) => `${field}: ${Array.isArray(msg) ? msg.join(", ") : msg}`)
            .join("\n");
        } else {
          errorMsg = String(errorData);
        }
      }
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Manage Products</h1>
          <p className="text-sm text-muted">Admin catalog, inventory, and dual-pricing dashboard.</p>
        </div>
        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsEditing(true);
            setForm({
              name: "",
              sku: "",
              model_number: "",
              category: "SCOOTER",
              description: "",
              specifications: "",
              features: "",
              public_price: "",
              vendor_price: "",
              availability: true,
              status: "ACTIVE",
              image: null,
            });
          }}
          className="flex items-center gap-2 bg-ink text-volt px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.isArray(products) && products.map((p) => {
          const imgUrl = getImageUrl(p.image);
          return (
            <Card key={p.id} className="p-0 overflow-hidden bg-white border border-black/[0.06] flex flex-col justify-between">
              <div>
                <div className="h-56 bg-surface relative flex items-center justify-center overflow-hidden">
                  {imgUrl ? (
                    <img 
                      src={imgUrl} 
                      alt={p.name} 
                      className="absolute inset-0 w-full h-full object-contain p-2" 
                      onError={(e) => { 
                        e.currentTarget.style.display = "none"; 
                      }} 
                    />
                  ) : (
                    <Package size={48} className="text-emerald/40" />
                  )}
                  <span className="absolute top-3 right-3 z-10 bg-ink text-white text-[10px] px-2 py-0.5 rounded-full uppercase shadow">
                    {p.category}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs text-muted font-medium">SKU: {p.sku || "N/A"}</p>
                  <h3 className="font-display text-lg font-semibold text-ink mt-0.5">{p.name}</h3>
                  
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-surface p-2.5 rounded-xl border border-black/5">
                    <div>
                      <span className="text-muted block text-[10px] uppercase">Visitor Price</span>
                      <span className="font-bold text-ink text-sm">₹{Number(p.public_price || 0).toLocaleString("en-IN")}</span>
                    </div>
                    <div>
                      <span className="text-muted block text-[10px] uppercase">Vendor Price</span>
                      <span className="font-bold text-emerald-dark text-sm">₹{Number(p.vendor_price || 0).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-black/5 p-3 grid grid-cols-3 gap-2 bg-surface/50">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedProduct(p);
                  }} 
                  className="flex items-center justify-center gap-1 text-xs font-medium py-1.5 px-2 bg-white rounded border hover:bg-surface cursor-pointer"
                >
                  <Eye size={13} /> View
                </button>
                <button 
                  type="button"
                  onClick={() => { setSelectedProduct(null); setForm(p); setIsEditing(true); }} 
                  className="flex items-center justify-center gap-1 text-xs font-medium py-1.5 px-2 bg-white rounded border hover:bg-surface"
                >
                  <Edit size={13} /> Edit
                </button>
                <button 
                  type="button"
                  onClick={() => handleDelete(p.id)} 
                  className="flex items-center justify-center gap-1 text-xs font-medium py-1.5 px-2 bg-coral/10 text-coral rounded hover:bg-coral/20"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add / Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button onClick={() => setIsEditing(false)} className="absolute top-4 right-4 text-muted hover:text-ink">
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-semibold font-display mb-4">
              {form.id ? "Edit Product" : "Add New Product"}
            </h2>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Product Name *</label>
                  <input required className="w-full border rounded-lg p-2.5" placeholder="e.g. Voltra S1 Pro" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">SKU Code *</label>
                  <input required className="w-full border rounded-lg p-2.5" placeholder="e.g. VOLTRA-S1-001" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Model Number / Batch</label>
                  <input className="w-full border rounded-lg p-2.5" placeholder="e.g. S1-PRO-2026" value={form.model_number || ""} onChange={(e) => setForm({...form, model_number: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Category</label>
                  <select className="w-full border rounded-lg p-2.5" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}>
                    <option value="SCOOTER">Scooter</option>
                    <option value="BATTERY">Battery</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-surface p-3 rounded-xl border border-black/5">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">Public Visitor Price (₹) *</label>
                  <input type="number" step="0.01" required className="w-full border rounded-lg p-2.5 bg-white" placeholder="0.00" value={form.public_price} onChange={(e) => setForm({...form, public_price: e.target.value})} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-emerald-dark mb-1">Registered Vendor Price (₹) *</label>
                  <input type="number" step="0.01" required className="w-full border rounded-lg p-2.5 bg-white" placeholder="0.00" value={form.vendor_price} onChange={(e) => setForm({...form, vendor_price: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Product Image</label>
                <div className="flex items-center gap-3 border rounded-lg p-2 bg-surface">
                  <input type="file" accept="image/*" onChange={(e) => setForm({...form, image: e.target.files[0]})} className="text-xs text-muted file:mr-4 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-ink file:text-volt hover:file:opacity-90" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Description</label>
                <textarea className="w-full border rounded-lg p-2.5" rows={4} placeholder="Detailed product description..." value={form.description || ""} onChange={(e) => setForm({...form, description: e.target.value})} />
              </div>

              <div>
                <label className="block text-xs font-medium text-muted mb-1">Features (one per line)</label>
                <textarea className="w-full border rounded-lg p-2.5" rows={2} placeholder="Fast charging&#10;120km range" value={form.features || ""} onChange={(e) => setForm({...form, features: e.target.value})} />
              </div>

              <button type="submit" disabled={loading} className="w-full bg-ink text-volt py-3 rounded-xl font-medium mt-2 hover:opacity-90 transition-opacity disabled:opacity-50">
                {loading ? "Saving Product..." : "Save Product"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 relative shadow-2xl">
            <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 text-muted hover:text-ink">
              <X size={20} />
            </button>
            
            <h2 className="text-xl font-semibold font-display mb-3">{selectedProduct.name}</h2>
            
            <div className="h-64 bg-surface rounded-xl overflow-hidden flex items-center justify-center mb-4 relative">
              {selectedProduct.image ? (
                <img 
                  src={getImageUrl(selectedProduct.image)} 
                  alt={selectedProduct.name} 
                  className="absolute inset-0 w-full h-full object-contain p-2" 
                />
              ) : (
                <Package size={56} className="text-emerald/30" />
              )}
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between bg-surface p-2.5 rounded-lg">
                <span className="text-muted">SKU Code:</span>
                <span className="font-medium">{selectedProduct.sku || "N/A"}</span>
              </div>
              <div className="flex justify-between bg-surface p-2.5 rounded-lg">
                <span className="text-muted">Model Number:</span>
                <span className="font-medium">{selectedProduct.model_number || "N/A"}</span>
              </div>
              <div className="flex justify-between bg-surface p-2.5 rounded-lg">
                <span className="text-muted">Category:</span>
                <span className="font-medium">{selectedProduct.category}</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface p-3 rounded-lg">
                  <span className="text-xs text-muted block">Visitor Price</span>
                  <span className="font-bold text-lg text-ink">₹{Number(selectedProduct.public_price || 0).toLocaleString("en-IN")}</span>
                </div>
                <div className="bg-emerald/5 p-3 rounded-lg border border-emerald/10">
                  <span className="text-xs text-muted block">Vendor Price</span>
                  <span className="font-bold text-lg text-emerald-dark">₹{Number(selectedProduct.vendor_price || 0).toLocaleString("en-IN")}</span>
                </div>
              </div>
              <div>
                <span className="text-xs text-muted block mb-1">Description</span>
                <p className="text-muted bg-surface p-3 rounded-lg">{selectedProduct.description || "No description provided."}</p>
              </div>
              {selectedProduct.features && (
                <div>
                  <span className="text-xs text-muted block mb-1">Features</span>
                  <p className="text-muted bg-surface p-3 rounded-lg whitespace-pre-line">{selectedProduct.features}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}