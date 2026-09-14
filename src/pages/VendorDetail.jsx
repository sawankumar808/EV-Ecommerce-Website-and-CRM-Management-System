import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Building, FileText, ShoppingBag, Battery, Users, History as HistoryIcon, ExternalLink, Download } from "lucide-react";
import client from "../api/client";
import { Card, PageHeader, StatusBadge, Button } from "../components/ui";

export default function VendorDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const getInitialTab = () => {
    const path = location.pathname;
    if (path.endsWith("/edit")) return "edit";
    if (path.endsWith("/history")) return "history";
    if (path.endsWith("/documents")) return "documents";
    if (path.endsWith("/sales")) return "sales";
    if (path.endsWith("/batteries")) return "batteries";
    if (path.endsWith("/customers")) return "customers";
    return "info";
  };

  const [activeTab, setActiveTab] = useState(getInitialTab());
  const [vendor, setVendor] = useState(null);
  const [formData, setFormData] = useState({});
  const [history, setHistory] = useState([]);
  const [related, setRelated] = useState({ sales: [], batteries: [], customers: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setActiveTab(getInitialTab());
  }, [location.pathname]);

  useEffect(() => {
    fetchVendorDetails();
  }, [id]);

  const fetchVendorDetails = async () => {
    setLoading(true);
    try {
      const res = await client.get(`/api/vendors/${id}/`);
      setVendor(res.data);
      setFormData(res.data);

      const historyRes = await client.get(`/api/vendors/${id}/history/`).catch(() => ({ data: [] }));
      setHistory(Array.isArray(historyRes.data) ? historyRes.data : historyRes.data.results || []);
      
      const [sales, batteries, customers] = await Promise.all([
        client.get(`/api/sales/?vendor=${id}`).catch(() => ({ data: [] })),
        client.get(`/api/batteries/?vendor=${id}`).catch(() => ({ data: [] })),
        client.get(`/api/customers/?vendor=${id}`).catch(() => ({ data: [] }))
      ]);
      
      setRelated({
        sales: sales.data.results || sales.data || [],
        batteries: batteries.data.results || batteries.data || [],
        customers: customers.data.results || customers.data || []
      });
    } catch (err) {
      console.error("Failed to load vendor detail", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    if (tabKey === "edit") navigate(`/crm/vendors/${id}/edit`);
    else if (tabKey === "history") navigate(`/crm/vendors/${id}/history`);
    else if (tabKey === "documents") navigate(`/crm/vendors/${id}/documents`);
    else if (tabKey === "sales") navigate(`/crm/vendors/${id}/sales`);
    else if (tabKey === "batteries") navigate(`/crm/vendors/${id}/batteries`);
    else if (tabKey === "customers") navigate(`/crm/vendors/${id}/customers`);
    else navigate(`/crm/vendors/${id}`);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await client.patch(`/api/vendors/${id}/`, formData);
      alert("Vendor details updated successfully!");
      navigate(`/crm/vendors/${id}`);
    } catch (err) {
      console.error("Failed to update vendor", err);
      alert("Failed to update vendor details.");
    }
  };

  if (loading) return <div className="p-6 text-center text-muted">Loading vendor details...</div>;
  if (!vendor) return <div className="p-6 text-center text-red-500">Vendor not found.</div>;

  const tabs = [
    { key: "info", label: "Vendor Information", icon: Building },
    { key: "edit", label: "Edit Vendor", icon: Save },
    { key: "documents", label: "Documents", icon: FileText },
    { key: "sales", label: "Sales", icon: ShoppingBag },
    { key: "batteries", label: "Batteries", icon: Battery },
    { key: "customers", label: "Customers", icon: Users },
    { key: "history", label: "Complete History", icon: HistoryIcon },
  ];

  const getFileUrl = (url) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    const baseURL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "") : "http://localhost:8000";
    return `${baseURL}${url.startsWith("/") ? "" : "/"}${url}`;
  };

  // View Handler: Agar file Word/Excel jaisi hai aur browser download kar raha hai, toh user ko alert dekar guide kar sakte hain ya direct open karein
  const handleViewFile = (fileUrl, title) => {
    if (fileUrl.match(/\.(docx|doc|xlsx|xls)$/i)) {
      alert(`"${title}" ek Word/Excel file hai. Local server par direct view support nahi karta, isliye yeh download hogi. Aap chahein toh PDF format mein upload kar sakte hain taaki seedha browser mein view ho sake.`);
    }
    window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const documentsList = Array.isArray(vendor.documents) ? vendor.documents : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" onClick={() => navigate("/crm/vendors")} className="p-2">
          <ArrowLeft size={16} />
        </Button>
        <PageHeader
          title={vendor.business_name || "Vendor Details"}
          subtitle={`GST: ${vendor.gst_number || "N/A"} | Mobile: ${vendor.mobile_number}`}
          action={<StatusBadge status={vendor.status} />}
        />
      </div>

      <div className="flex border-b border-black/10 overflow-x-auto gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? "border-emerald-600 text-emerald-600 bg-emerald-50/50"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "info" && (
        <Card className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-muted block text-xs">Business Name</span>
            <p className="font-semibold text-ink">{vendor.business_name}</p>
          </div>
          <div>
            <span className="text-muted block text-xs">Contact Person</span>
            <p className="font-semibold text-ink">{vendor.contact_person}</p>
          </div>
          <div>
            <span className="text-muted block text-xs">Email Address</span>
            <p className="font-semibold text-ink">{vendor.email}</p>
          </div>
          <div>
            <span className="text-muted block text-xs">Mobile Number</span>
            <p className="font-semibold text-ink">{vendor.mobile_number}</p>
          </div>
          <div>
            <span className="text-muted block text-xs">City & State</span>
            <p className="font-semibold text-ink">{vendor.city}, {vendor.state}</p>
          </div>
          <div>
            <span className="text-muted block text-xs">GST & PAN Number</span>
            <p className="font-semibold text-ink">{vendor.gst_number || "—"} / {vendor.pan_number || "—"}</p>
          </div>
        </Card>
      )}

      {activeTab === "edit" && (
        <Card className="p-6">
          <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Business Name</label>
              <input
                type="text"
                value={formData.business_name || ""}
                onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Contact Person</label>
              <input
                type="text"
                value={formData.contact_person || ""}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">Mobile Number</label>
              <input
                type="text"
                value={formData.mobile_number || ""}
                onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">City</label>
              <input
                type="text"
                value={formData.city || ""}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={() => handleTabChange("info")}>Cancel</Button>
              <Button type="submit" variant="primary">Save Changes</Button>
            </div>
          </form>
        </Card>
      )}

      {activeTab === "documents" && (
        <Card className="p-6">
          <h3 className="font-semibold text-base mb-4 text-ink">Uploaded Business Documents</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documentsList.length > 0 ? (
              documentsList.map((doc, idx) => {
                const fileUrl = getFileUrl(doc.file || doc.file_url || doc.document);
                
                let docTitle = "Business Document";
                let docSubText = `Uploaded on: ${doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : "N/A"}`;

                if (idx === 0) {
                  docTitle = "GST Certificate";
                  docSubText = vendor.gst_number ? `GST: ${vendor.gst_number}` : "GST Document";
                } else if (idx === 1) {
                  docTitle = "PAN Card";
                  docSubText = vendor.pan_number ? `PAN: ${vendor.pan_number}` : "PAN Document";
                } else if (idx === 2) {
                  docTitle = "Address Proof";
                  docSubText = vendor.city ? `City: ${vendor.city}` : "Address Verification";
                }

                return (
                  <div key={idx} className="p-4 border border-black/10 rounded-lg flex items-center justify-between bg-surface/30">
                    <div className="flex items-center gap-3">
                      <FileText className="text-emerald-600" size={24} />
                      <div>
                        <p className="font-medium text-sm text-ink">{docTitle}</p>
                        <p className="text-xs text-muted">{docSubText}</p>
                      </div>
                    </div>
                    {fileUrl !== "#" ? (
                      <div className="flex items-center gap-2">
                        {/* View Button */}
                        <button
                          type="button"
                          onClick={() => handleViewFile(fileUrl, docTitle)}
                          className="px-2.5 py-1.5 text-xs font-medium bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-1 cursor-pointer"
                          title="View Document"
                        >
                          <ExternalLink size={12} /> View
                        </button>

                        {/* Download Button */}
                        <a 
                          href={fileUrl} 
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-md hover:bg-emerald-100 transition-colors flex items-center gap-1"
                          title="Download Document"
                        >
                          <Download size={12} /> Download
                        </a>
                      </div>
                    ) : (
                      <span className="text-xs text-muted">No File Attached</span>
                    )}
                  </div>
                );
              })
            ) : (
              <p className="text-muted text-sm col-span-2 py-4 text-center">No documents uploaded during registration for this vendor.</p>
            )}
          </div>
        </Card>
      )}

      {activeTab === "history" && (
        <Card className="p-6">
          <h3 className="font-semibold text-base mb-4">Vendor Lifecycle & Activity History</h3>
          {history.length === 0 ? (
            <p className="text-muted text-sm">No activity logs recorded yet for this vendor.</p>
          ) : (
            <div className="relative border-l border-emerald-300 ml-4 pl-6 space-y-6">
              {history.map((h, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[31px] top-0 w-3.5 h-3.5 bg-emerald-600 rounded-full border-2 border-white" />
                  <p className="text-xs text-muted">{new Date(h.created_at || h.timestamp).toLocaleString()}</p>
                  <p className="text-sm font-medium text-ink">{h.action || h.title}</p>
                  <p className="text-xs text-muted mt-0.5">{h.description || h.details || "Activity performed"}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "sales" && <Card className="p-6"><h3 className="font-semibold mb-4">Vendor Sales</h3>{related.sales.length?<div className="space-y-2">{related.sales.map(x=><div key={x.id} className="flex justify-between border-b py-2 text-sm"><span>{x.sale_number} · {x.customer_name||"—"}</span><span>₹{Number(x.amount).toLocaleString("en-IN")}</span></div>)}</div>:<p className="text-sm text-muted">No sales for this vendor.</p>}</Card>}
      {activeTab === "batteries" && <Card className="p-6"><h3 className="font-semibold mb-4">Assigned Batteries</h3>{related.batteries.length?<div className="space-y-2">{related.batteries.map(x=><div key={x.id} className="flex justify-between border-b py-2 text-sm"><span className="font-mono">{x.battery_id}</span><StatusBadge status={x.status}/></div>)}</div>:<p className="text-sm text-muted">No batteries assigned.</p>}</Card>}
      {activeTab === "customers" && <Card className="p-6"><h3 className="font-semibold mb-4">Vendor Customers</h3>{related.customers.length?<div className="space-y-2">{related.customers.map(x=><div key={x.id} className="flex justify-between border-b py-2 text-sm"><span>{x.name}</span><span className="text-muted">{x.mobile}</span></div>)}</div>:<p className="text-sm text-muted">No customers for this vendor.</p>}</Card>}
    </div>
  );
}