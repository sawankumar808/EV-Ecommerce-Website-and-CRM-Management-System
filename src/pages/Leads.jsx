import { useEffect, useState } from "react";
import { Phone, IndianRupee, Plus } from "lucide-react";
import client from "../api/client";
import { PageHeader, Button } from "../components/ui";

export default function Leads() {
  const [stages, setStages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [dragId, setDragId] = useState(null);

  async function load() {
    const [stagesRes, leadsRes] = await Promise.all([
      client.get("/pipeline-stages/"),
      client.get("/leads/"),
    ]);
    setStages(stagesRes.data.results || stagesRes.data);
    setLeads(leadsRes.data.results || leadsRes.data);
  }

  useEffect(() => { load(); }, []);

  async function moveLead(leadId, stageId) {
    setLeads((prev) => prev.map((l) => (l.id === leadId ? { ...l, stage: stageId } : l)));
    await client.post(`/leads/${leadId}/change_stage/`, { stage_id: stageId });
  }

  const priorityColor = { HIGH: "border-l-coral", MEDIUM: "border-l-amber", LOW: "border-l-emerald" };

  return (
    <div>
      <PageHeader
        title="Sales Pipeline"
        subtitle="Drag a card to move a lead through its stage."
        action={<Button variant="primary"><Plus size={15} /> New Lead</Button>}
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          const value = stageLeads.reduce((sum, l) => sum + Number(l.expected_deal_value || 0), 0);
          return (
            <div
              key={stage.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragId && moveLead(dragId, stage.id)}
              className="w-72 shrink-0 bg-black/[0.02] rounded-xl2 p-3"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <p className="text-sm font-semibold text-ink">{stage.name}</p>
                  <p className="text-xs text-muted">{stageLeads.length} leads · ₹{value.toLocaleString("en-IN")}</p>
                </div>
              </div>
              <div className="space-y-2 min-h-[60px]">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    className={`bg-white rounded-lg shadow-card p-3 border-l-[3px] ${priorityColor[lead.priority] || "border-l-black/10"} cursor-grab active:cursor-grabbing`}
                  >
                    <p className="text-sm font-medium text-ink">{lead.name}</p>
                    <p className="text-xs text-muted mb-2">{lead.company || "—"}</p>
                    <div className="flex items-center justify-between text-xs text-muted">
                      <span className="flex items-center gap-1"><Phone size={11} /> {lead.mobile}</span>
                      <span className="flex items-center gap-1 font-medium text-ink">
                        <IndianRupee size={11} /> {Number(lead.expected_deal_value || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {stages.length === 0 && <p className="text-muted text-sm">No pipeline stages configured.</p>}
      </div>
    </div>
  );
}
