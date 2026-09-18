import { useEffect, useState, useCallback } from "react";
import { Check, X, Pause, Play, Search, Eye, Edit3, History, FileEdit, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { Card, PageHeader, StatusBadge, Button, Select } from "../components/ui";
import { useAuth } from "../context/AuthContext";

export default function Vendors() {
  const [vendors, setVendors] = useState([]);
  const [salesUsers, setSalesUsers] = useState([]);
  const [selectedVendorForAssign, setSelectedVendorForAssign] = useState(null);
  const [assignedSalesId, setAssignedSalesId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const loadVendors = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (search.trim()) params.search = search.trim();

    try {
      const res = await client.get("/vendors/", { params });
      let vendorList = [];
      if (Array.isArray(res.data)) {
        vendorList = res.data;
      } else if (res.data?.results && Array.isArray(res.data.results)) {
        vendorList = res.data.results;
      } else if (res.data?.data && Array.isArray(res.data.data)) {
        vendorList = res.data.data;
      }
      setVendors(vendorList);
    } catch (err) {
      console.error("Failed to load vendors:", err);
      setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [status, search]);

  const loadSalesUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      // Using sales-team-summary which is already aliased in client.js to fetch team members correctly
      const res = await client.get("/sales-team-summary/");
      let allUsers = [];
      const data = res?.data;
      if (Array.isArray(data)) {
        allUsers = data;
      } else if (data?.results && Array.isArray(data.results)) {
        allUsers = data.results;
      } else if (data?.data && Array.isArray(data.data)) {
        allUsers = data.data;
      }
      setSalesUsers(allUsers);
    } catch (err) {
      console.error("Failed to fetch sales users", err);
      setSalesUsers([]);
    }
  }, [isAdmin]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadVendors();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadVendors]);

  useEffect(() => {
    loadSalesUsers();
  }, [loadSalesUsers]);

  const act = async (e, id, action) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      await client.post(`/vendors/${id}/${action}/`);
      loadVendors();
    } catch (err) {
      console.error(`Failed to execute ${action}`, err);
    }
  };

  const handleAssignSalesperson = async (e) => {
    if (e) e.preventDefault();
    if (!selectedVendorForAssign) return;
    try {
      await client.patch(`/vendors/${selectedVendorForAssign.id}/`, {
        assigned_salesperson: assignedSalesId ? parseInt(assignedSalesId) : null,
      });
      setSelectedVendorForAssign(null);
      loadVendors();
    } catch (err) {
      console.error("Failed to assign salesperson", err);
      alert("Failed to assign salesperson.");
    }
  };

  const getSalespersonName = (v) => {
    if (v.assigned_salesperson_name) return v.assigned_salesperson_name;
    const sp = v.assigned_salesperson_details || v.assigned_salesperson;
    if (!sp) return "Unassigned";
    if (typeof sp === "object") {
      if (sp.first_name) {
        return `${sp.first_name} ${sp.last_name || ""}`.trim();
      }
      return sp.username || "Assigned";
    }
    const found = salesUsers.find((u) => u.id === sp);
    if (found) {
      return found.name || (found.first_name ? `${found.first_name} ${found.last_name || ""}`.trim() : found.username);
    }
    return `Sales #${sp}`;
  };

  return (
    <div>
      <PageHeader
        title="Vendors"
        subtitle="Registration, onboarding and approval for all vendors."
        action={
          <Button variant="primary" onClick={() => navigate("/vendor/register")}>
            + Add Vendor
          </Button>
        }
      />

      <Card className="p-4 mb-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile, GST..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/30"
          />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-48">
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
          <option value="INACTIVE">Inactive</option>
        </Select>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left font-medium px-4 py-3">Vendor</th>
              <th className="text-left font-medium px-4 py-3">Contact</th>
              <th className="text-left font-medium px-4 py-3">Email</th>
              <th className="text-left font-medium px-4 py-3">City</th>
              <th className="text-left font-medium px-4 py-3">GST Number</th>
              <th className="text-left font-medium px-4 py-3">Assigned Sales</th>
              <th className="text-left font-medium px-4 py-3">Reg. Date</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-right font-medium px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/[0.05]">
            {vendors.map((v) => (
              <tr key={v.id} className="hover:bg-surface/60">
                <td className="px-4 py-3 font-medium text-ink">{v.business_name}</td>
                <td className="px-4 py-3 text-muted">
                  {v.contact_person}
                  <br />
                  <span className="text-xs">{v.mobile_number}</span>
                </td>
                <td className="px-4 py-3 text-muted text-xs">{v.email}</td>
                <td className="px-4 py-3 text-muted">
                  {v.city}, {v.state}
                </td>
                <td className="px-4 py-3 text-muted font-mono text-xs">{v.gst_number || "—"}</td>

                <td className="px-4 py-3 text-muted text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-ink">{getSalespersonName(v)}</span>
                    {isAdmin && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setSelectedVendorForAssign(v);
                          const spId =
                            typeof v.assigned_salesperson === "object"
                              ? v.assigned_salesperson?.id
                              : v.assigned_salesperson;
                          setAssignedSalesId(spId || "");
                        }}
                        title="Assign / Change Sales Executive"
                        className="text-emerald-dark hover:text-emerald p-1 cursor-pointer"
                      >
                        <UserPlus size={14} />
                      </button>
                    )}
                  </div>
                </td>

                <td className="px-4 py-3 text-muted text-xs">
                  {v.registered_at ? new Date(v.registered_at).toLocaleDateString() : "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/crm/vendors/${v.id}`);
                      }}
                      title="View Details"
                      className="w-7 h-7 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 cursor-pointer"
                    >
                      <Eye size={14} />
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/crm/vendors/${v.id}/edit`);
                          }}
                          title="Edit Vendor"
                          className="w-7 h-7 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                        >
                          <Edit3 size={14} />
                        </button>

                        {v.status !== "APPROVED" && (
                          <button
                            type="button"
                            onClick={(e) => act(e, v.id, "approve")}
                            title="Approve"
                            className="w-7 h-7 rounded-md bg-emerald/10 text-emerald-dark flex items-center justify-center hover:bg-emerald/20 cursor-pointer"
                          >
                            <Check size={14} />
                          </button>
                        )}

                        {v.status === "PENDING" && (
                          <button
                            type="button"
                            onClick={(e) => act(e, v.id, "request_changes")}
                            title="Request Changes"
                            className="w-7 h-7 rounded-md bg-amber-50 text-amber-600 flex items-center justify-center hover:bg-amber-100 cursor-pointer"
                          >
                            <FileEdit size={14} />
                          </button>
                        )}

                        {v.status !== "REJECTED" && (
                          <button
                            type="button"
                            onClick={(e) => act(e, v.id, "reject")}
                            title="Reject"
                            className="w-7 h-7 rounded-md bg-coral/10 text-coral flex items-center justify-center hover:bg-coral/20 cursor-pointer"
                          >
                            <X size={14} />
                          </button>
                        )}

                        {v.status === "SUSPENDED" ? (
                          <button
                            type="button"
                            onClick={(e) => act(e, v.id, "activate")}
                            title="Activate"
                            className="w-7 h-7 rounded-md bg-black/5 text-muted flex items-center justify-center hover:bg-black/10 cursor-pointer"
                          >
                            <Play size={14} />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={(e) => act(e, v.id, "suspend")}
                            title="Suspend"
                            className="w-7 h-7 rounded-md bg-black/5 text-muted flex items-center justify-center hover:bg-black/10 cursor-pointer"
                          >
                            <Pause size={14} />
                          </button>
                        )}
                      </>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/crm/vendors/${v.id}/history`);
                      }}
                      title="View Complete History"
                      className="w-7 h-7 rounded-md bg-purple-50 text-purple-600 flex items-center justify-center hover:bg-purple-100 cursor-pointer"
                    >
                      <History size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {loading && (
              <tr>
                <td colSpan={9} className="text-center text-muted py-8">
                  Loading vendors...
                </td>
              </tr>
            )}

            {!loading && vendors.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center text-muted py-10">
                  No vendors found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Assign Sales Executive Modal */}
      {selectedVendorForAssign && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl border border-black/10">
            <h3 className="font-display font-semibold text-lg text-ink mb-1">Assign Sales Executive</h3>
            <p className="text-xs text-muted mb-4">
              Select a sales executive to assign to{" "}
              <span className="font-semibold text-ink">{selectedVendorForAssign.business_name}</span>.
            </p>

            <div className="mb-6">
              <label className="text-xs font-medium text-muted uppercase tracking-wide block mb-1.5">
                Sales Executive
              </label>
              <select
                value={assignedSalesId}
                onChange={(e) => setAssignedSalesId(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-black/10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald/40 bg-white"
              >
                <option value="">Unassigned</option>
                {salesUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || (u.first_name ? `${u.first_name} ${u.last_name || ""}` : u.username)} (
                    {u.email || u.mobile_number || "Sales"})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setSelectedVendorForAssign(null)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAssignSalesperson}>
                Save Assignment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}