import { useEffect, useState } from "react";
import { Phone, IndianRupee, Plus, UserCheck, Trash2, X } from "lucide-react";
import client from "../api/client";
import { PageHeader, Button } from "../components/ui";

export default function Leads() {
  const [stages, setStages] = useState([]);
  const [leads, setLeads] = useState([]);
  const [salesTeam, setSalesTeam] = useState([]);
  const [dragId, setDragId] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [currentUser, setCurrentUser] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    mobile: "",
    sales_person: "",
    expected_deal_value: "",
    priority: "MEDIUM",
    stage: "",
  });

  const syncUserContext = () => {
    let username = "";
    let role = "SALES";
    let isSuper = false;

    const possibleUserKeys = [
      "username",
      "user_name",
      "name",
      "email",
      "user",
      "auth_user",
      "userData",
    ];

    for (const key of possibleUserKeys) {
      const val = localStorage.getItem(key);
      if (val) {
        if (val.startsWith("{")) {
          try {
            const parsed = JSON.parse(val);
            username =
              parsed.username ||
              parsed.name ||
              parsed.first_name ||
              parsed.email ||
              username;
            if (parsed.role) role = parsed.role;
            if (parsed.is_superuser || parsed.is_staff) isSuper = true;
          } catch (e) {}
        } else if (!username) {
          username = val;
        }
      }
    }

    const storedRole = (
      localStorage.getItem("role") ||
      localStorage.getItem("user_role") ||
      role
    )
      .toString()
      .toUpperCase();

    const isStaff = localStorage.getItem("is_staff") === "true";
    const isSuperuser = localStorage.getItem("is_superuser") === "true";

    const adminCheck =
      storedRole.includes("ADMIN") || isSuper || isStaff || isSuperuser;

    if (!username) {
      username = "User";
    }

    setCurrentUser(username);
    setIsAdmin(adminCheck);

    return { username, adminCheck };
  };

  const fetchUsers = async () => {
    const endpoints = ["/sales-team/", "/users/", "/crm/users/"];

    let rawUsers = [];

    for (const url of endpoints) {
      try {
        const res = await client.get(url);
        const data = res.data.results || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          rawUsers = data;
          break;
        }
      } catch {
        continue;
      }
    }

    // Dynamic Filter: Includes Admin + All current & future Sales accounts
    const salesOnly = rawUsers.filter((u) => {
      const uname = (u.username || u.name || u.first_name || "").toLowerCase();
      const email = (u.email || "").toLowerCase();
      const role = (u.role || u.user_role || u.type || "").toString().toLowerCase();

      // Exclude Vendors or internal non-crm system accounts
      if (role.includes("vendor") || role.includes("supplier")) {
        return false;
      }

      // Exclude old buggy test accounts
      if (uname === "arun" || uname === "shubham") {
        return false;
      }

      // Allow Admin + Active Sales Staff (sawankumar, raju, admin, future sales users)
      return true;
    });

    // Remove duplicates by Unique Username / Email
    const uniqueUsers = [];
    const seenKeys = new Set();

    salesOnly.forEach((u) => {
      const identifier = (u.username || u.email || "").toLowerCase();
      if (identifier && !seenKeys.has(identifier)) {
        seenKeys.add(identifier);
        uniqueUsers.push(u);
      }
    });

    return uniqueUsers;
  };

  async function load() {
    try {
      syncUserContext();
      const [stagesRes, leadsRes] = await Promise.all([
        client.get("/pipeline-stages/").catch(() => client.get("/crm/pipeline-stages/")),
        client.get("/leads/").catch(() => client.get("/crm/leads/")),
      ]);

      const loadedStages = stagesRes.data.results || stagesRes.data || [];
      const loadedLeads = leadsRes.data.results || leadsRes.data || [];

      setStages(loadedStages);
      setLeads(loadedLeads);

      const team = await fetchUsers();
      setSalesTeam(team);
    } catch (err) {
      console.error("Pipeline load error:", err);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const handleOpenModal = () => {
    syncUserContext();
    setFormData({
      name: "",
      company: "",
      mobile: "",
      sales_person: "",
      expected_deal_value: "",
      priority: "MEDIUM",
      stage: stages[0]?.id || "",
    });
    setShowModal(true);
  };

  async function moveLead(leadId, stageId) {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, stage: stageId } : l))
    );
    try {
      await client
        .post(`/leads/${leadId}/change_stage/`, { stage_id: stageId })
        .catch(() => client.post(`/crm/leads/${leadId}/change_stage/`, { stage_id: stageId }));
    } catch (err) {
      console.error("Stage update error:", err);
    }
  }

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm("Is lead ko pipeline se delete karna chahte hain?")) return;
    try {
      await client.delete(`/leads/${leadId}/`).catch(() => client.delete(`/crm/leads/${leadId}/`));
      setLeads((prev) => prev.filter((l) => l.id !== leadId));
    } catch (err) {
      alert("Lead delete nahi ho saki.");
    }
  };

  const handleCreateLead = async (e) => {
    e.preventDefault();
    try {
      await client.post("/leads/", formData).catch(() => client.post("/crm/leads/", formData));
      setShowModal(false);
      load();
    } catch (err) {
      alert("Error creating lead: " + (err.response?.data?.detail || err.message));
    }
  };

  const priorityColor = {
    HIGH: "border-l-red-500",
    MEDIUM: "border-l-amber-500",
    LOW: "border-l-emerald-500",
  };

  return (
    <div>
      <PageHeader
        title="Sales Pipeline"
        subtitle="Manage and track active sales deals."
        action={
          <Button variant="primary" onClick={handleOpenModal}>
            <Plus size={15} /> New Lead
          </Button>
        }
      />

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => {
          const stageLeads = leads.filter((l) => l.stage === stage.id);
          const value = stageLeads.reduce(
            (sum, l) => sum + Number(l.expected_deal_value || 0),
            0
          );
          return (
            <div
              key={stage.id}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => dragId && moveLead(dragId, stage.id)}
              className="w-72 shrink-0 bg-black/[0.02] rounded-xl p-3 border border-black/5"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div>
                  <p className="text-sm font-semibold text-ink">{stage.name}</p>
                  <p className="text-xs text-muted">
                    {stageLeads.length} leads · ₹{value.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>

              <div className="space-y-2 min-h-[60px]">
                {stageLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDragId(lead.id)}
                    className={`bg-white rounded-lg shadow-sm p-3 border-l-[4px] ${
                      priorityColor[lead.priority] || "border-l-gray-300"
                    } cursor-grab active:cursor-grabbing border border-black/5 hover:shadow-md transition-shadow relative group`}
                  >
                    <button
                      onClick={() => handleDeleteLead(lead.id)}
                      className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>

                    <p className="text-sm font-medium text-ink pr-5">{lead.name}</p>
                    <p className="text-xs text-muted">{lead.company || "No Company"}</p>

                    <div className="flex items-center gap-1 text-[11px] text-muted pt-1">
                      <UserCheck size={12} className="text-blue-600" />
                      <span>{lead.sales_person_name || lead.sales_person || currentUser}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted pt-2 border-t mt-2">
                      <span className="flex items-center gap-1">
                        <Phone size={11} /> {lead.mobile || "—"}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-ink">
                        <IndianRupee size={11} />{" "}
                        {Number(lead.expected_deal_value || 0).toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {stages.length === 0 && (
          <p className="text-muted text-sm py-4">No pipeline stages available.</p>
        )}
      </div>

      {/* CREATE LEAD MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-lg font-semibold text-ink">Add New Lead</h3>
              <button onClick={() => setShowModal(false)} className="text-muted hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3">
              <div>
                <label className="text-xs text-muted block mb-1">Lead Name *</label>
                <input
                  type="text"
                  required
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs text-muted block mb-1">Company</label>
                <input
                  type="text"
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="e.g. Acme Logistics"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>

              {/* SALES PERSON + ADMIN DROPDOWN */}
              <div>
                <label className="text-xs text-muted block mb-1">Assigned Sales Person *</label>
                {isAdmin ? (
                  <select
                    className="w-full border rounded-lg p-2 text-sm bg-white"
                    value={formData.sales_person}
                    onChange={(e) => setFormData({ ...formData, sales_person: e.target.value })}
                    required
                  >
                    <option value="">Select Sales Person / Admin</option>
                    {salesTeam.map((person) => {
                      const uname =
                        person.username || person.name || person.first_name || person.email;
                      return (
                        <option key={person.id || uname} value={uname}>
                          {uname}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    type="text"
                    readOnly
                    className="w-full border rounded-lg p-2 text-sm bg-gray-100 text-gray-700 font-medium cursor-not-allowed"
                    value={`${currentUser} (Sales Executive)`}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted block mb-1">Mobile *</label>
                  <input
                    type="text"
                    required
                    className="w-full border rounded-lg p-2 text-sm"
                    placeholder="9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Deal Value (₹)</label>
                  <input
                    type="number"
                    className="w-full border rounded-lg p-2 text-sm"
                    placeholder="50000"
                    value={formData.expected_deal_value}
                    onChange={(e) =>
                      setFormData({ ...formData, expected_deal_value: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted block mb-1">Priority</label>
                  <select
                    className="w-full border rounded-lg p-2 text-sm"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-muted block mb-1">Stage *</label>
                  <select
                    className="w-full border rounded-lg p-2 text-sm bg-white"
                    value={formData.stage}
                    onChange={(e) => setFormData({ ...formData, stage: e.target.value })}
                    required
                  >
                    {stages.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-muted hover:bg-black/5 rounded-lg"
                >
                  Cancel
                </button>
                <Button type="submit">Create Lead</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}