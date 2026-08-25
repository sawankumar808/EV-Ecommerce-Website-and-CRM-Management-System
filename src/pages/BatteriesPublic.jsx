import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";

export default function BatteryPublic() {
  const { id } = useParams();

  const [battery, setBattery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchBattery = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await client.get(`/batteries/${id}/`);
        setBattery(response.data);
      } catch (err) {
        console.error("Battery fetch error:", err);

        if (err.response?.status === 404) {
          setError("Battery not found.");
        } else if (err.response?.status === 401) {
          setError("Battery information requires authentication.");
        } else {
          setError("Unable to load battery information.");
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBattery();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-xl font-semibold text-gray-800">
            Loading battery information...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-3">
            Battery Not Available
          </h1>

          <p className="text-gray-600">
            {error}
          </p>

          <p className="text-sm text-gray-400 mt-4">
            Battery ID: {id}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">

          <div className="bg-gray-900 text-white px-6 py-5">
            <h1 className="text-2xl font-bold">
              Battery Information
            </h1>

            <p className="text-gray-300 text-sm mt-1">
              Battery ID: {battery?.battery_id || id}
            </p>
          </div>

          <div className="p-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <Info
                label="Battery ID"
                value={battery?.battery_id}
              />

              <Info
                label="Serial Number"
                value={battery?.serial_number}
              />

              <Info
                label="Model"
                value={battery?.model}
              />

              <Info
                label="Battery Type"
                value={battery?.battery_type}
              />

              <Info
                label="Batch"
                value={
                  battery?.batch_number ||
                  battery?.batch ||
                  "-"
                }
              />

              <Info
                label="G1 / G2"
                value={battery?.g_code}
              />

              <Info
                label="Manufacturing Date"
                value={battery?.manufacturing_date}
              />

              <Info
                label="Added Date"
                value={battery?.added_date}
              />

              <Info
                label="Warranty"
                value={battery?.warranty_period}
              />

              <Info
                label="Status"
                value={battery?.status}
              />

            </div>

            {battery?.vendor && (
              <div className="mt-8 border-t pt-6">
                <h2 className="text-lg font-semibold mb-4">
                  Assignment Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Info
                    label="Vendor"
                    value={
                      typeof battery.vendor === "object"
                        ? battery.vendor.name ||
                          battery.vendor.vendor_name
                        : battery.vendor
                    }
                  />

                  <Info
                    label="Customer"
                    value={
                      typeof battery.customer === "object"
                        ? battery.customer.name ||
                          battery.customer.customer_name
                        : battery.customer
                    }
                  />

                  <Info
                    label="Scooter"
                    value={
                      typeof battery.scooter === "object"
                        ? battery.scooter.scooter_id ||
                          battery.scooter.registration_number
                        : battery.scooter
                    }
                  />
                </div>
              </div>
            )}

            {battery?.qr_code_image && (
              <div className="mt-8 border-t pt-6 text-center">
                <h2 className="text-lg font-semibold mb-4">
                  Battery QR Code
                </h2>

                <img
                  src={battery.qr_code_image}
                  alt="Battery QR Code"
                  className="w-48 h-48 mx-auto object-contain"
                />
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </p>

      <p className="font-medium text-gray-900">
        {value || "-"}
      </p>
    </div>
  );
}