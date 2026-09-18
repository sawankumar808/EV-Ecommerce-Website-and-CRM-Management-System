import {
  useEffect,
  useState,
} from "react";

import {
  Plus,
  Save,
  Trash2,
  Users,
  Edit3,
} from "lucide-react";

import client from "../api/client";

import {
  Card,
  PageHeader,
  Button,
  Input,
  Select,
} from "../components/ui";

const emptyRole = {
  id: null,
  name: "",
  category: "OTHER",
  permissions: {},
  is_active: true,
};

const emptyUser = {
  id: null,
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  password: "",
  custom_role: "",
};

export default function RoleManagement() {
  const [roles, setRoles] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [users, setUsers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [roleForm, setRoleForm] = useState(emptyRole);
  const [userForm, setUserForm] = useState(emptyUser);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [savingRole, setSavingRole] = useState(false);
  const [savingUser, setSavingUser] = useState(false);

  const load = async () => {
    try {
      const [
        roleResponse,
        catalogResponse,
        userResponse,
        customerResponse,
      ] = await Promise.allSettled([
        client.get("/roles/"),
        client.get("/roles/catalog/"),
        client.get("/users/"),
        client.get("/customers/"),
      ]);

      if (roleResponse.status === "fulfilled") {
        setRoles(
          roleResponse.value.data.results ||
          roleResponse.value.data ||
          []
        );
      }

      if (catalogResponse.status === "fulfilled") {
        setCatalog(
          catalogResponse.value.data ||
          []
        );
      }

      if (userResponse.status === "fulfilled") {
        const uData = userResponse.value.data;
        const uList = Array.isArray(uData) ? uData : (uData.results || uData.data || []);
        setUsers(uList);
      }

      if (customerResponse.status === "fulfilled") {
        const cData = customerResponse.value.data;
        const cList = Array.isArray(cData) ? cData : (cData.results || cData.data || []);
        setCustomers(cList);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
        "Could not load role management data."
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const togglePermission = (resource, action) => {
    setRoleForm((current) => {
      const permissions = {
        ...(current.permissions || {}),
      };

      const currentActions = Array.isArray(permissions[resource])
        ? [...permissions[resource]]
        : [];

      if (currentActions.includes(action)) {
        permissions[resource] = currentActions.filter(
          (item) => item !== action
        );
      } else {
        permissions[resource] = [...currentActions, action];
      }

      return {
        ...current,
        permissions,
      };
    });
  };

  const hasPermission = (resource, action) => {
    return (
      roleForm.permissions?.[resource]?.includes(action) || false
    );
  };

  const saveRole = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSavingRole(true);

    try {
      const payload = {
        name: roleForm.name,
        category: roleForm.category,
        permissions: roleForm.permissions || {},
        is_active: roleForm.is_active,
      };

      if (roleForm.id) {
        await client.patch(`/roles/${roleForm.id}/`, payload);
        setMessage("Role updated successfully.");
      } else {
        await client.post("/roles/", payload);
        setMessage("New role created successfully.");
      }

      setRoleForm(emptyRole);
      await load();
    } catch (err) {
      console.error("Save role error:", err.response?.data);
      const errData = err.response?.data;
      let errMsg = "Failed to save role.";
      if (errData) {
        if (typeof errData === "object") {
          errMsg = Object.entries(errData)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(" | ");
        } else {
          errMsg = String(errData);
        }
      }
      setError(errMsg);
    } finally {
      setSavingRole(false);
    }
  };

  const editRole = (role) => {
    setError("");
    setMessage("");
    setRoleForm({
      id: role.id,
      name: role.name,
      category: role.category || "OTHER",
      permissions: role.permissions || {},
      is_active: role.is_active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteRole = async (role) => {
    if (!window.confirm(`Delete role "${role.name}"?`)) return;

    try {
      await client.delete(`/roles/${role.id}/`);
      setMessage("Role removed successfully.");
      if (roleForm.id === role.id) {
        setRoleForm(emptyRole);
      }
      load();
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to delete role."
      );
    }
  };

  const editUser = (user) => {
    setError("");
    setMessage("");
    // Find matching role ID based on user.role code
    const matchedRole = roles.find(r => r.code === user.role);
    setUserForm({
      id: user.id,
      username: user.username || "",
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      email: user.email || "",
      phone: user.phone || user.mobile_number || "",
      password: "",
      custom_role: matchedRole ? matchedRole.id : (user.custom_role || ""),
    });
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setSavingUser(true);

    try {
      const payload = {
        username: userForm.username,
        first_name: userForm.first_name,
        last_name: userForm.last_name,
        email: userForm.email,
        phone: userForm.phone,
        mobile_number: userForm.phone,
        custom_role: userForm.custom_role ? Number(userForm.custom_role) : null,
      };

      if (userForm.password) {
        payload.password = userForm.password;
      }

      if (userForm.id) {
        await client.patch(`/users/${userForm.id}/`, payload);
        setMessage("User account updated successfully.");
      } else {
        if (!userForm.password) {
          setError("Password is required for new user.");
          setSavingUser(false);
          return;
        }
        await client.post("/users/", payload);
        setMessage("User account created successfully.");
      }

      setUserForm(emptyUser);
      await load();
    } catch (err) {
      console.error("Save user error:", err.response?.data);
      const errData = err.response?.data;
      let errMsg = "Failed to save user.";
      if (errData) {
        if (typeof errData === "object") {
          errMsg = Object.entries(errData)
            .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
            .join(" | ");
        } else {
          errMsg = String(errData);
        }
      }
      setError(errMsg);
    } finally {
      setSavingUser(false);
    }
  };

  // Correct count matching role code (e.g. "MANAGEMENT")
  const getRoleUserCount = (roleCode) => {
    return users.filter((u) => u.role === roleCode).length;
  };

  // Filter out ADMIN users from table display
  const nonAdminUsers = users.filter((u) => u.role !== "ADMIN");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Management"
        subtitle="Create roles, assign dashboard access and control view/add/edit/delete permissions."
      />

      {message && (
        <div className="p-3 bg-emerald/10 border border-emerald/20 rounded-lg text-emerald-dark text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* CREATE / EDIT ROLE */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="font-display text-lg font-semibold">
              {roleForm.id ? "Edit Role" : "Create New Role"}
            </h2>
            <p className="text-xs text-muted mt-1">
              Example: Management, Accounts, Finance Manager
            </p>
          </div>
          {roleForm.id && (
            <Button variant="outline" onClick={() => setRoleForm(emptyRole)}>
              Cancel Edit
            </Button>
          )}
        </div>

        <form onSubmit={saveRole} className="space-y-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-muted block mb-1">
                Role Name *
              </label>
              <Input
                required
                value={roleForm.name}
                onChange={(event) =>
                  setRoleForm({ ...roleForm, name: event.target.value })
                }
                placeholder="e.g. Management"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted block mb-1">
                Category
              </label>
              <Select
                value={roleForm.category}
                onChange={(event) =>
                  setRoleForm({ ...roleForm, category: event.target.value })
                }
              >
                <option value="MANAGEMENT">Management</option>
                <option value="ACCOUNTS">Accounts</option>
                <option value="OTHER">Other</option>
              </Select>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">
              Dashboard / Function Access
            </h3>
            <div className="space-y-2">
              {catalog.map((item) => (
                <div key={item.key} className="border border-black/10 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-sm">{item.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {item.actions.map((action) => (
                      <label
                        key={action}
                        className="flex items-center gap-2 text-xs cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={hasPermission(item.key, action)}
                          onChange={() => togglePermission(item.key, action)}
                          className="rounded"
                        />
                        <span className="capitalize">{action}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={savingRole}>
              <Save size={15} />
              {savingRole ? "Saving..." : roleForm.id ? "Update Role" : "Create Role"}
            </Button>
          </div>
        </form>
      </Card>

      {/* SUMMARY & USER COUNTS */}
      <Card className="p-6">
        <h2 className="font-display text-lg font-semibold mb-4">
          Roles & Users Summary Records
        </h2>
        
        {/* Built-in Roles Counts (Sales, Vendor, Customers) - Admin excluded */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="border border-black/10 rounded-xl p-4 bg-surface/40">
            <p className="text-xs text-muted font-medium uppercase">Sales Executives</p>
            <p className="text-xl font-bold text-ink mt-1">
              {users.filter((u) => u.role === "SALES").length} Users
            </p>
          </div>
          <div className="border border-black/10 rounded-xl p-4 bg-surface/40">
            <p className="text-xs text-muted font-medium uppercase">Vendor Partners</p>
            <p className="text-xl font-bold text-ink mt-1">
              {users.filter((u) => u.role === "VENDOR").length} Users
            </p>
          </div>
          <div className="border border-black/10 rounded-xl p-4 bg-surface/40">
            <p className="text-xs text-muted font-medium uppercase">Customers</p>
            <p className="text-xl font-bold text-ink mt-1">
              {customers.length} Customers
            </p>
          </div>
        </div>

        <h3 className="font-display text-sm font-semibold mb-3 text-muted uppercase tracking-wide">
          Custom Roles & Assigned Counts
        </h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((role) => {
            const count = getRoleUserCount(role.code);
            return (
              <div key={role.id} className="border border-black/10 rounded-xl p-4 bg-surface/30">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-ink">{role.name}</h3>
                    <p className="text-[11px] text-muted font-mono mt-1">
                      {role.code}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-surface font-semibold text-emerald-dark">
                    {count} {count === 1 ? "User" : "Users"}
                  </span>
                </div>
                <p className="text-xs text-muted mt-3">
                  {Object.values(role.permissions || {}).flat().length} permissions assigned
                </p>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" onClick={() => editRole(role)}>
                    Edit Role
                  </Button>
                  <Button variant="danger" onClick={() => deleteRole(role)}>
                    <Trash2 size={14} /> Delete
                  </Button>
                </div>
              </div>
            );
          })}
          {roles.length === 0 && (
            <p className="text-sm text-muted">No custom roles created yet.</p>
          )}
        </div>
      </Card>

      {/* CREATE / EDIT USER */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Users size={19} className="text-emerald" />
            <div>
              <h2 className="font-display text-lg font-semibold">
                {userForm.id ? "Edit User Account" : "Create User Account"}
              </h2>
              <p className="text-xs text-muted">
                {userForm.id ? "Update user details or role assignment." : "Create username, email/mobile and password for a role."}
              </p>
            </div>
          </div>
          {userForm.id && (
            <Button variant="outline" onClick={() => setUserForm(emptyUser)}>
              Cancel Edit
            </Button>
          )}
        </div>

        <form onSubmit={saveUser} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              required
              placeholder="Username *"
              value={userForm.username}
              onChange={(event) =>
                setUserForm({ ...userForm, username: event.target.value })
              }
            />
            <Input
              placeholder="First Name"
              value={userForm.first_name}
              onChange={(event) =>
                setUserForm({ ...userForm, first_name: event.target.value })
              }
            />
            <Input
              placeholder="Last Name"
              value={userForm.last_name}
              onChange={(event) =>
                setUserForm({ ...userForm, last_name: event.target.value })
              }
            />
            <Input
              type="email"
              placeholder="Email"
              value={userForm.email}
              onChange={(event) =>
                setUserForm({ ...userForm, email: event.target.value })
              }
            />
            <Input
              placeholder="Mobile Number"
              value={userForm.phone}
              onChange={(event) =>
                setUserForm({ ...userForm, phone: event.target.value })
              }
            />
            <Input
              type="password"
              placeholder={userForm.id ? "Password (Leave blank to keep current)" : "Password *"}
              value={userForm.password}
              onChange={(event) =>
                setUserForm({ ...userForm, password: event.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-medium text-muted block mb-1">
              Assign Custom Role *
            </label>
            <Select
              required
              value={userForm.custom_role}
              onChange={(event) =>
                setUserForm({ ...userForm, custom_role: event.target.value })
              }
            >
              <option value="">Select Role</option>
              {roles
                .filter((role) => role.is_active)
                .map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
            </Select>
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={savingUser}>
              <Plus size={15} />
              {savingUser ? "Saving..." : userForm.id ? "Update User" : "Create User"}
            </Button>
          </div>
        </form>
      </Card>

      {/* USERS */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-black/5">
          <h2 className="font-display font-semibold">Created Users</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-surface text-muted text-xs uppercase">
              <tr>
                <th className="text-left p-4">Username</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Mobile</th>
                <th className="text-left p-4">Role</th>
                <th className="text-right p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {nonAdminUsers.map((user) => (
                <tr key={user.id}>
                  <td className="p-4 font-medium">{user.username}</td>
                  <td className="p-4 text-muted">{user.email || "—"}</td>
                  <td className="p-4 text-muted">{user.phone || user.mobile_number || "—"}</td>
                  <td className="p-4">
                    {user.role_name || user.role || "—"}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      type="button"
                      onClick={() => editUser(user)}
                      title="Edit User"
                      className="w-7 h-7 rounded-md bg-gray-100 text-gray-700 inline-flex items-center justify-center hover:bg-gray-200 cursor-pointer"
                    >
                      <Edit3 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {nonAdminUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-4 text-center text-muted">
                    No users created yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}