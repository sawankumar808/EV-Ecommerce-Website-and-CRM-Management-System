import { useEffect, useState } from "react";
import client from "../api/client";

import {
  Card,
  PageHeader,
  StatusBadge,
  Button,
  Input,
  Modal,
  FormGrid,
  Field,
  Select,
} from "../components/ui";


export default function Scooters() {
  const [items, setItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [batteries, setBatteries] = useState([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [assign, setAssign] = useState(null);

  const [err, setErr] = useState("");

  const initialFormState = {
    scooter_id: "",
    registration_number: "",
    brand: "",
    model: "",
    chassis_number: "",
    motor_number: "",
    customer: "",
    vendor: "",
    purchase_date: "",
    status: "IN_STOCK",
    remarks: "",
  };

  const [form, setForm] = useState(initialFormState);


  const fetchDropdowns = () => {
    Promise.all([
      client.get("/api/customers/"),
      client.get("/api/vendors/"),
      client.get("/api/batteries/?status=IN_STOCK"),
    ])
      .then(([customerResponse, vendorResponse, batteryResponse]) => {
        setCustomers(
          customerResponse.data.results || customerResponse.data || []
        );

        setVendors(
          vendorResponse.data.results || vendorResponse.data || []
        );

        setBatteries(
          batteryResponse.data.results || batteryResponse.data || []
        );
      })
      .catch((e) => {
        console.error(
          "Failed to load dropdown data:",
          e.response?.data || e.message
        );
      });
  };


  const load = () => {
    client
      .get("/api/scooters/")
      .then((response) => {
        setItems(
          response.data.results || response.data || []
        );
      })
      .catch((e) => {
        console.error(
          "Failed to load scooters:",
          e.response?.data || e.message
        );
      });

    fetchDropdowns();
  };


  useEffect(() => {
    load();
  }, []);


  const handleOpenAddModal = () => {
    setErr("");
    setEditing(null);
    setForm(initialFormState);
    setOpen(true);
    fetchDropdowns();
  };


  const handleOpenEditModal = (scooter) => {
    setErr("");
    setEditing(scooter);

    setForm({
      scooter_id: scooter.scooter_id || "",
      registration_number:
        scooter.registration_number || "",
      brand: scooter.brand || "",
      model: scooter.model || "",
      chassis_number:
        scooter.chassis_number || "",
      motor_number:
        scooter.motor_number || "",
      customer:
        scooter.customer || "",
      vendor:
        scooter.vendor || "",
      purchase_date:
        scooter.purchase_date || "",
      status:
        scooter.status || "IN_STOCK",
      remarks:
        scooter.remarks || "",
    });

    setOpen(true);
    fetchDropdowns();
  };


  const save = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      const payload = {
        ...form,
        customer: form.customer
          ? Number(form.customer)
          : null,
        vendor: form.vendor
          ? Number(form.vendor)
          : null,
      };

      if (editing) {
        await client.patch(
          `/api/scooters/${editing.id}/`,
          payload
        );
      } else {
        await client.post(
          "/api/scooters/",
          payload
        );
      }

      setOpen(false);
      setEditing(null);
      setForm(initialFormState);

      load();
    } catch (e) {
      setErr(
        typeof e.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : e.response?.data || e.message
      );
    }
  };


  const doAssign = async (e) => {
    e.preventDefault();
    setErr("");

    if (!assign?.battery) {
      setErr("Please select a battery.");
      return;
    }

    try {
      await client.post(
        `/api/scooters/${assign.id}/assign_battery/`,
        {
          battery_id: Number(assign.battery),
        }
      );

      setAssign(null);
      load();
    } catch (e) {
      setErr(
        typeof e.response?.data === "object"
          ? JSON.stringify(e.response.data)
          : e.response?.data?.error ||
            e.response?.data ||
            e.message
      );
    }
  };


  return (
    <div className="space-y-6">

      <PageHeader
        title="Scooter Management"
        subtitle="Scooter creation, battery installation and status/replacement updates."
        action={
          <Button onClick={handleOpenAddModal}>
            + Add Scooter
          </Button>
        }
      />


      {err && (
        <div className="p-3 bg-coral/10 border border-coral/20 rounded-lg text-coral text-sm">
          {err}
        </div>
      )}


      {/* Scooters List Table */}

      <Card className="overflow-hidden">
        <table className="w-full text-sm">

          <thead className="bg-surface text-muted text-xs uppercase tracking-wide">
            <tr>
              {[
                "Scooter ID",
                "Reg. Number",
                "Brand / Model",
                "Customer",
                "Vendor",
                "Installed Battery",
                "Status",
                "Actions",
              ].map((x) => (
                <th
                  key={x}
                  className="text-left px-4 py-3 font-medium"
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>


          <tbody className="divide-y divide-black/5">

            {items.map((scooter) => (
              <tr
                key={scooter.id}
                className="hover:bg-surface/50"
              >

                <td className="px-4 py-3 font-mono font-semibold text-ink">
                  {scooter.scooter_id}
                </td>


                <td className="px-4 py-3 text-muted">
                  {scooter.registration_number || "—"}
                </td>


                <td className="px-4 py-3 text-ink font-medium">
                  {scooter.brand} {scooter.model}
                </td>


                <td className="px-4 py-3 text-muted">
                  {scooter.customer_name || "—"}
                </td>


                <td className="px-4 py-3 text-muted">
                  {scooter.vendor_name || "—"}
                </td>


                <td className="px-4 py-3 font-mono text-xs font-semibold text-emerald-600">
                  {scooter.installed_battery || "—"}
                </td>


                <td className="px-4 py-3">
                  <StatusBadge status={scooter.status} />
                </td>


                <td className="px-4 py-3 flex items-center gap-2">

                  <Button
                    variant="outline"
                    onClick={() =>
                      handleOpenEditModal(scooter)
                    }
                  >
                    Edit
                  </Button>


                  <Button
                    variant="outline"
                    onClick={() => {
                      setErr("");

                      setAssign({
                        ...scooter,
                        battery: "",
                      });

                      fetchDropdowns();
                    }}
                  >
                    {scooter.installed_battery
                      ? "Replace Battery"
                      : "Assign Battery"}
                  </Button>

                </td>

              </tr>
            ))}


            {items.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="text-center py-8 text-muted"
                >
                  No scooters found.
                </td>
              </tr>
            )}

          </tbody>

        </table>
      </Card>


      {/* Add / Edit Scooter Modal */}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditing(null);
        }}
        title={
          editing
            ? "Edit Scooter & Status"
            : "Add Scooter"
        }
      >

        <form
          onSubmit={save}
          className="space-y-4"
        >

          <FormGrid>

            {[
              ["Scooter ID", "scooter_id"],
              ["Registration Number", "registration_number"],
              ["Brand", "brand"],
              ["Model", "model"],
              ["Chassis Number", "chassis_number"],
              ["Motor Number", "motor_number"],
              ["Purchase Date", "purchase_date"],
            ].map(([label, key]) => (

              <Field
                key={key}
                label={label}
              >

                <Input
                  required={[
                    "scooter_id",
                    "brand",
                    "model",
                    "chassis_number",
                  ].includes(key)}
                  type={
                    key === "purchase_date"
                      ? "date"
                      : "text"
                  }
                  value={form[key]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      [key]: e.target.value,
                    })
                  }
                  placeholder={label}
                />

              </Field>

            ))}


            {/* Status */}

            <Field label="Status">

              <Select
                value={form.status}
                onChange={(e) =>
                  setForm({
                    ...form,
                    status: e.target.value,
                  })
                }
              >

                <option value="IN_STOCK">
                  In Stock
                </option>

                <option value="SOLD">
                  Sold
                </option>

                <option value="RENTED">
                  Rented
                </option>

              </Select>

            </Field>


            {/* Customer */}

            <Field label="Customer">

              <Select
                value={form.customer}
                onChange={(e) =>
                  setForm({
                    ...form,
                    customer: e.target.value,
                  })
                }
              >

                <option value="">
                  None
                </option>

                {customers.map((customer) => (
                  <option
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name ||
                      customer.first_name ||
                      `Customer #${customer.id}`}
                  </option>
                ))}

              </Select>

            </Field>


            {/* Vendor */}

            <Field label="Vendor">

              <Select
                value={form.vendor}
                onChange={(e) =>
                  setForm({
                    ...form,
                    vendor: e.target.value,
                  })
                }
              >

                <option value="">
                  None
                </option>

                {vendors.map((vendor) => (
                  <option
                    key={vendor.id}
                    value={vendor.id}
                  >
                    {vendor.business_name ||
                      vendor.name ||
                      `Vendor #${vendor.id}`}
                  </option>
                ))}

              </Select>

            </Field>

          </FormGrid>


          <div className="flex justify-end gap-2 pt-2">

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                setEditing(null);
              }}
            >
              Cancel
            </Button>

            <Button type="submit">
              {editing
                ? "Update Scooter"
                : "Create Scooter"}
            </Button>

          </div>

        </form>

      </Modal>


      {/* Assign Battery Modal */}

      <Modal
        open={!!assign}
        onClose={() => setAssign(null)}
        title="Assign / Replace Battery"
      >

        <form
          onSubmit={doAssign}
          className="space-y-4"
        >

          <Field label="Battery">

            <Select
              required
              value={assign?.battery || ""}
              onChange={(e) =>
                setAssign({
                  ...assign,
                  battery: e.target.value,
                })
              }
            >

              <option value="">
                Select battery
              </option>

              {batteries.map((battery) => (
                <option
                  key={battery.id}
                  value={battery.id}
                >
                  {battery.battery_id} ·{" "}
                  {battery.serial_number}
                </option>
              ))}

            </Select>

          </Field>


          <div className="flex justify-end gap-2 pt-2">

            <Button
              type="button"
              variant="outline"
              onClick={() => setAssign(null)}
            >
              Cancel
            </Button>

            <Button type="submit">
              Install Battery
            </Button>

          </div>

        </form>

      </Modal>

    </div>
  );
}