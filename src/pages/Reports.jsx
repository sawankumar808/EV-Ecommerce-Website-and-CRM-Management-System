import { useEffect, useState } from "react";
import client from "../api/client";
import { Card, PageHeader } from "../components/ui";

export default function Reports() {
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/reports-summary/")
      .then((res) => {
        setReports(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch reports summary:", err);
        setError("Reports load karne me dikkat aai. Kripya refresh karein.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-8 text-center text-muted">Loading reports...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-coral">{error}</div>;
  }

  if (!reports) {
    return <div className="p-8 text-center text-muted">No report data available.</div>;
  }

  const summaryCards = [
    [
      "Vendors",
      reports.vendors?.total || 0,
      `Approved ${reports.vendors?.approved || 0} · Pending ${reports.vendors?.pending || 0}`,
    ],
    [
      "Sales",
      reports.sales?.total || 0,
      `Amount ₹${Number(reports.sales?.amount || 0).toLocaleString("en-IN")}`,
    ],
    [
      "Customers",
      reports.customers?.total || 0,
      "Total registered customers",
    ],
    [
      "Batteries",
      reports.batteries?.total || 0,
      `Stock ${reports.batteries?.stock || 0} · Sold ${reports.batteries?.sold || 0}`,
    ],
    [
      "Scooters",
      reports.scooters?.total || 0,
      "Total active scooters",
    ],
    [
      "Coupons",
      reports.coupons?.total || 0,
      `Active ${reports.coupons?.active || 0} · Used ${reports.coupons?.used || 0}`,
    ],
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Vendor, sales, battery, scooter and coupon summaries."
      />

      {/* Main KPI Summary Grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {summaryCards.map(([title, total, subtitle]) => (
          <Card key={title} className="p-5 flex flex-col justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wider font-medium">
                {title}
              </p>
              <p className="font-display text-2xl font-semibold text-ink mt-2">
                {total}
              </p>
            </div>
            <p className="text-xs text-muted mt-3 pt-2 border-t border-black/5">
              {subtitle}
            </p>
          </Card>
        ))}
      </div>

      {/* Battery Status Breakdown */}
      {reports.batteries && (
        <Card className="p-5">
          <h3 className="font-display font-semibold text-ink mb-4">
            Battery Status Report
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Object.entries(reports.batteries)
              .filter(([key]) => key !== "total")
              .map(([statusKey, count]) => (
                <div
                  key={statusKey}
                  className="bg-surface border border-black/5 rounded-lg p-3 text-center"
                >
                  <p className="text-xs text-muted capitalize">
                    {statusKey.replace("_", " ")}
                  </p>
                  <p className="font-semibold text-ink text-base mt-1">
                    {count}
                  </p>
                </div>
              ))}
          </div>
        </Card>
      )}
    </div>
  );
}