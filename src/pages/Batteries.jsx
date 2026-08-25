import { useEffect, useState } from "react";
import { QrCode, Layers, Plus, Eye, Printer, X } from "lucide-react";
import client from "../api/client";
import { Card, PageHeader, StatusBadge, Button, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Batteries() {
  const [tab, setTab] = useState("batteries");
  const [batteries, setBatteries] = useState([]);
  const [batches, setBatches] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedQrBattery, setSelectedQrBattery] = useState(null);
  const { user } = useAuth();

  const isAdmin = user?.role === "ADMIN";

  async function loadBatteries() {
    const params = statusFilter ? { status: statusFilter } : {};
    const res = await client.get("/batteries/", { params });
    setBatteries(res.data.results || res.data);
  }

  async function loadBatches() {
    const res = await client.get("/battery-batches/");
    setBatches(res.data.results || res.data);
  }

  useEffect(() => { loadBatteries(); loadBatches(); }, [statusFilter]);

  async function generateQr(id) {
    if (!isAdmin) return;
    await client.post(`/batteries/${id}/generate_qr/`);
    loadBatteries();
  }

  async function generateFromBatch(id) {
    if (!isAdmin) return;
    await client.post(`/battery-batches/${id}/generate_batteries/`);
    loadBatches();
    loadBatteries();
  }

  return (
    <div>
      <PageHeader
        title="Battery Management"
        subtitle="Batch-wise creation, individual battery tracking, QR codes and lifecycle status."
        action={isAdmin ? <Button variant="primary"><Plus size={15} /> Add Battery Batch</Button> : null}
      />

      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("batteries")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "batteries" ? "bg-ink text-volt" : "bg-white text-muted border border-black/10"}`}>
          Individual Batteries
        </button>
        <button onClick={() => setTab("batches")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "batches" ? "bg-ink text-volt" : "bg-white text-muted border border-black/10"}`}>
          Battery Batches
        </button>
      </div>

      {tab === "batteries" && (
        <>
          <Card className="p-4 mb-4 flex gap-3">
            <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-56">
              <option value="">All statuses</option>
              {["ADDED", "IN_STOCK", "ASSIGNED_VENDOR", "SOLD", "ASSIGNED_CUSTOMER", "INSTALLED", "IN_SERVICE", "RETURNED", "DAMAGED", "REPLACED", "INACTIVE"].map(s => (
                <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
              ))}
            </Select>
          </Card>

          <Card className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left font-medium px-5 py-3">Battery ID</th>
                  <th className="text-left font-medium px-5 py-3">Serial No.</th>
                  <th className="text-left font-medium px-5 py-3">Batch</th>
                  <th className="text-left font-medium px-5 py-3">G1/G2</th>
                  <th className="text-left font-medium px-5 py-3">Status</th>
                  <th className="text-right font-medium px-5 py-3">Actions & QR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.05]">
                {batteries.map((b) => (
                  <tr key={b.id} className="hover:bg-surface/60">
                    <td className="px-5 py-3 font-mono text-xs font-medium text-ink">{b.battery_id}</td>
                    <td className="px-5 py-3 font-mono text-xs text-muted">{b.serial_number}</td>
                    <td className="px-5 py-3 text-muted">{b.batch_number}</td>
                    <td className="px-5 py-3 text-muted">{b.g_code || "—"}</td>
                    <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {b.qr_code_image && (
                          <button
                            onClick={() => setSelectedQrBattery(b)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                          >
                            <Eye size={13} /> View QR
                          </button>
                        )}
                        {isAdmin && (
                          <button onClick={() => generateQr(b.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-dark hover:underline">
                            <QrCode size={13} /> {b.qr_code_image ? "Regenerate" : "Generate"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {batteries.length === 0 && (
                  <tr><td colSpan={6} className="text-center text-muted py-10">No batteries found.</td></tr>
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
                  <p className="text-xs text-muted mt-0.5">{b.battery_model} · {b.battery_type} · {b.g_code}</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="charge-bar mb-2">
                <span style={{ width: `${b.quantity ? (b.generated_count / b.quantity) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-muted mb-4">{b.generated_count} / {b.quantity} batteries generated</p>
              {isAdmin && b.generated_count < b.quantity && (
                <Button variant="outline" onClick={() => generateFromBatch(b.id)}>
                  Generate remaining batteries
                </Button>
              )}
            </Card>
          ))}
          {batches.length === 0 && <p className="text-muted text-sm">No batches yet.</p>}
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
            <p className="text-xs font-mono text-muted mt-0.5">{selectedQrBattery.battery_id}</p>
            
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
              <Button variant="primary" className="w-full flex items-center justify-center gap-1.5" onClick={() => window.print()}>
                <Printer size={14} /> Print
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}