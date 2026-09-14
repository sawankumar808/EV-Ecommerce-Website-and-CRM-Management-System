import { useEffect, useState } from "react";
import { QrCode, Layers, Plus, Eye, Printer, X } from "lucide-react";
import client from "../api/client";
import { Card, PageHeader, StatusBadge, Button, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Batteries() {
  const [tab, setTab] = useState("batteries");
  const [batteries, setBatteries] = useState([]);
  const [batches, setBatches] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedQrBattery, setSelectedQrBattery] = useState(null);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const [batchForm, setBatchForm] = useState({
    batch_number: "",
    battery_model: "Lithium-Ion Standard",
    battery_type: "60V 40Ah",
    quantity: 10,
    manufacturing_date: todayStr,
    g_code: "G1",
    guarantee_years: 1,
    warranty_years: 1,
    warranty_period_months: 24,
    remarks: "",
  });

  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const allStatuses = [
    "ADDED",
    "IN_STOCK",
    "ASSIGNED_VENDOR",
    "SOLD",
    "ASSIGNED_CUSTOMER",
    "INSTALLED",
    "IN_SERVICE",
    "RETURNED",
    "DAMAGED",
    "REPLACED",
    "INACTIVE",
  ];

  const generateSerialNumber = (mfgDateStr, typeStr, guarantee = 1, warranty = 1, index = 2000) => {
    const monthLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M"];
    const dateObj = mfgDateStr ? new Date(mfgDateStr) : new Date();
    const monthIndex = dateObj.getMonth();
    const monthLetter = monthLetters[monthIndex] || "A";

    const digitsOnly = typeStr.replace(/\D/g, ""); 
    const voltAhCode = digitsOnly || "6040";

    const fullYear = dateObj.getFullYear().toString();
    const yy = fullYear.slice(-2);
    const dd = String(dateObj.getDate()).padStart(2, "0");
    const yearDateCode = `${yy}${dd}`;

    return `ROE${monthLetter}${index}${guarantee}G${warranty}W${voltAhCode}/${yearDateCode}`;
  };

  async function loadBatteries() {
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const res = await client.get("/api/batteries/", { params });
      setBatteries(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load batteries", err);
    }
  }

  async function loadBatches() {
    try {
      const res = await client.get("/api/battery-batches/");
      setBatches(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load batches", err);
    }
  }

  async function loadVendors() {
    try {
      const res = await client.get("/api/vendors/");
      const allVendors = res.data.results || res.data;
      
      // FIX: Sirf APPROVED vendors ko filter karna
      const approvedVendors = allVendors.filter(
        (v) => v.status?.toUpperCase() === "APPROVED"
      );
      setVendors(approvedVendors);
    } catch (err) {
      console.error("Failed to load vendors", err);
    }
  }

  useEffect(() => {
    loadBatteries();
    loadBatches();
    loadVendors();
  }, [statusFilter]);

  const getQrCodeUrl = (text) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`;
  };

  const handleStatusChange = async (batteryId, newStatus) => {
    try {
      await client.patch(`/api/batteries/${batteryId}/`, { status: newStatus });
      setBatteries((prev) =>
        prev.map((b) => (b.id === batteryId ? { ...b, status: newStatus } : b))
      );
    } catch (err) {
      console.error("Failed to update status:", err.response?.data);
      alert("Failed to update battery status.");
    }
  };

  const handleVendorAssign = async (batteryId, vendorId) => {
    try {
      await client.patch(`/api/batteries/${batteryId}/`, { 
        vendor: vendorId ? parseInt(vendorId, 10) : null,
        status: vendorId ? "ASSIGNED_VENDOR" : "IN_STOCK"
      });
      loadBatteries();
      alert("Battery vendor assignment updated successfully!");
    } catch (err) {
      console.error("Failed to assign vendor:", err.response?.data);
      alert("Failed to assign vendor to battery.");
    }
  };

  async function generateFromBatch(id) {
    if (!isAdmin) return;
    try {
      await client.post(`/api/battery-batches/${id}/generate_batteries/`);
      loadBatches();
      loadBatteries();
      alert("Batteries generated from batch successfully!");
    } catch (err) {
      console.error("Batch generation error:", err.response?.data || err);
      alert("Failed to generate batteries from batch");
    }
  }

  const handleCreateBatch = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const sampleSerial = generateSerialNumber(
        batchForm.manufacturing_date,
        batchForm.battery_type,
        batchForm.guarantee_years,
        batchForm.warranty_years,
        2000
      );

      const payload = {
        batch_number: batchForm.batch_number.trim(),
        battery_model: batchForm.battery_model.trim(),
        battery_type: batchForm.battery_type.trim(),
        quantity: parseInt(batchForm.quantity, 10),
        manufacturing_date: batchForm.manufacturing_date,
        g_code: batchForm.g_code,
        guarantee_years: parseInt(batchForm.guarantee_years, 10),
        warranty_years: parseInt(batchForm.warranty_years, 10),
        warranty_period_months: parseInt(batchForm.warranty_period_months, 10) || 24,
        remarks: batchForm.remarks || "",
        status: "CREATED",
        sample_serial_number: sampleSerial,
      };

      await client.post("/api/battery-batches/", payload);
      alert("Battery Batch created successfully!");
      setShowBatchModal(false);
      setBatchForm({
        batch_number: "",
        battery_model: "Lithium-Ion Standard",
        battery_type: "60V 40Ah",
        quantity: 10,
        manufacturing_date: todayStr,
        g_code: "G1",
        guarantee_years: 1,
        warranty_years: 1,
        warranty_period_months: 24,
        remarks: "",
      });
      loadBatches();
      loadBatteries();
    } catch (err) {
      console.error("Batch Creation Error:", err.response?.data);
      const errorMsg =
        typeof err.response?.data === "object"
          ? JSON.stringify(err.response.data)
          : err.response?.data?.detail || "Failed to save battery batch";
      alert(`Failed to save: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const currentPreviewSerial = generateSerialNumber(
    batchForm.manufacturing_date,
    batchForm.battery_type,
    batchForm.guarantee_years,
    batchForm.warranty_years,
    2000
  );

  return (
    <div>
      <PageHeader
        title="Battery Management"
        subtitle="Batch-wise creation, individual battery tracking, vendor assignments and lifecycle status."
        action={
          isAdmin ? (
            <Button variant="primary" onClick={() => setShowBatchModal(true)}>
              <Plus size={15} /> Add Battery Batch
            </Button>
          ) : null
        }
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("batteries")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "batteries"
              ? "bg-ink text-volt"
              : "bg-white text-muted border border-black/10"
          }`}
        >
          Individual Batteries
        </button>
        <button
          onClick={() => setTab("batches")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${
            tab === "batches"
              ? "bg-ink text-volt"
              : "bg-white text-muted border border-black/10"
          }`}
        >
          Battery Batches
        </button>
      </div>

      {tab === "batteries" && (
        <>
          <Card className="p-4 mb-4 flex gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-56"
            >
              <option value="">All statuses</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s.replaceAll("_", " ")}
                </option>
              ))}
            </Select>
          </Card>

          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Battery ID</th>
                  <th className="text-left font-medium px-5 py-3">Serial No.</th>
                  <th className="text-left font-medium px-5 py-3">Assigned Vendor</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-right font-medium px-5 py-3">Actions & QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {batteries.map((b) => {
                  const serialText = b.serial_number || b.battery_id;
                  const qrImage = b.qr_code_image || getQrCodeUrl(serialText);
                  const currentVendorId = b.vendor?.id || b.vendor || "";

                  return (
                    <tr key={b.id} className="hover:bg-surface/60">
                      <td className="px-5 py-3 font-mono text-xs font-medium text-ink">
                        {b.battery_id}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs font-semibold text-blue-600">
                        {b.serial_number || "—"}
                      </td>
                      <td className="px-5 py-3">
                        {isAdmin ? (
                          <select
                            value={currentVendorId}
                            onChange={(e) => handleVendorAssign(b.id, e.target.value)}
                            className="px-2.5 py-1 rounded-md text-xs font-medium border border-black/10 bg-white text-ink focus:outline-none focus:ring-1 focus:ring-emerald-500 w-44 truncate"
                          >
                            <option value="">-- Select Approved Vendor --</option>
                            {vendors.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.business_name} ({v.city || "N/A"})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-xs text-muted">
                            {b.vendor_name || b.vendor?.business_name || "Unassigned"}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isAdmin ? (
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className="px-2.5 py-1 rounded-md text-xs font-semibold border border-black/10 bg-white text-ink focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            {allStatuses.map((s) => (
                              <option key={s} value={s}>
                                {s.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <StatusBadge status={b.status} />
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedQrBattery({ ...b, qr_code_image: qrImage })}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                          >
                            <Eye size={13} /> View QR
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {batteries.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-10">
                      No batteries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </>
      )}

      {tab === "batches" && (
        <div className="grid md:grid-cols-2 gap-4">
          {batches.map((b) => (
            <Card key={b.id} className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-display font-semibold text-ink flex items-center gap-2">
                    <Layers size={15} className="text-emerald" /> {b.batch_number}
                  </p>
                  <p className="text-xs text-muted mt-0.5">
                    {b.battery_model} · {b.battery_type} · {b.g_code}
                  </p>
                </div>
                <StatusBadge status={b.status} />
              </div>

              <div className="text-xs text-muted space-y-1 mb-4">
                <p>Quantity: <strong>{b.quantity}</strong></p>
                <p>Mfg Date: {b.manufacturing_date}</p>
                <p>Warranty Period: {b.warranty_period_months} months</p>
              </div>

              {isAdmin && b.status !== "COMPLETED" && (
                <Button variant="outline" onClick={() => generateFromBatch(b.id)}>
                  Generate Batteries (1 to {b.quantity})
                </Button>
              )}
            </Card>
          ))}
          {batches.length === 0 && (
            <p className="text-muted text-sm">No batches yet.</p>
          )}
        </div>
      )}

      {/* Add Battery Batch Modal */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative shadow-xl border border-black/10">
            <button
              onClick={() => setShowBatchModal(false)}
              className="absolute top-3 right-3 text-muted hover:text-ink"
            >
              <X size={18} />
            </button>
            <h3 className="font-display font-semibold text-lg text-ink mb-1">
              Add New Battery Batch
            </h3>
            <p className="text-xs text-muted mb-4">
              Format: ROE-[Month]-[Index]-[Guar]G[Warr]W-[Volt/Ah]/[YYDD]
            </p>

            <form onSubmit={handleCreateBatch} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-muted mb-1">Batch Number</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g. BATCH-2026-001"
                  value={batchForm.batch_number}
                  onChange={(e) => setBatchForm({ ...batchForm, batch_number: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Battery Model</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g. Lithium-Ion"
                    value={batchForm.battery_model}
                    onChange={(e) => setBatchForm({ ...batchForm, battery_model: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Battery Type (Volt/Ah)</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g. 60V 40Ah"
                    value={batchForm.battery_type}
                    onChange={(e) => setBatchForm({ ...batchForm, battery_type: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Guarantee Years (...G)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g. 1 for 1G"
                    value={batchForm.guarantee_years}
                    onChange={(e) => setBatchForm({ ...batchForm, guarantee_years: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Warranty Years (...W)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g. 1 for 1W"
                    value={batchForm.warranty_years}
                    onChange={(e) => setBatchForm({ ...batchForm, warranty_years: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Manufacturing Date</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={batchForm.manufacturing_date}
                    onChange={(e) => setBatchForm({ ...batchForm, manufacturing_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    className="w-full px-3 py-2 border rounded-lg"
                    value={batchForm.quantity}
                    onChange={(e) => setBatchForm({ ...batchForm, quantity: e.target.value })}
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 mt-2">
                <span className="text-[11px] text-gray-500 font-medium block">
                  Generated Serial Preview:
                </span>
                <span className="text-xs font-mono font-bold text-blue-600 block mt-0.5">
                  {currentPreviewSerial}
                </span>
              </div>

              <div className="flex gap-2 justify-end mt-5">
                <Button type="button" variant="outline" onClick={() => setShowBatchModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? "Creating..." : "Create Batch"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedQrBattery && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-xs w-full p-6 text-center relative shadow-xl border border-black/10">
            <button
              onClick={() => setSelectedQrBattery(null)}
              className="absolute top-3 right-3 text-muted hover:text-ink"
            >
              <X size={18} />
            </button>
            <h3 className="font-display font-semibold text-lg text-ink">Battery QR Code</h3>
            <p className="text-xs font-mono text-blue-600 font-semibold mt-0.5">
              {selectedQrBattery.serial_number || selectedQrBattery.battery_id}
            </p>

            <div className="my-5 flex justify-center border p-3 rounded-lg bg-surface">
              <img
                src={selectedQrBattery.qr_code_image}
                alt="QR Code"
                className="w-44 h-44 object-contain"
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="w-full" onClick={() => setSelectedQrBattery(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                className="w-full flex items-center justify-center gap-1.5"
                onClick={() => window.print()}
              >
                <Printer size={14} /> Print
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}