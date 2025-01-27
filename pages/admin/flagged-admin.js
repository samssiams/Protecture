import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useEffect, useState } from "react";

export default function FlaggedAdmin() {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch flagged reports from the backend
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/admin/admin-flagged");
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await response.json();
        setReports(data.reports);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter(
    (report) =>
      report.reportedBy.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedUser.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5FDF4]">
      <Navbar />
      <div className="pt-24 px-8 flex justify-center">
        <div className="w-full max-w-4xl">
          <Tabs />
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search reports by reporter, reported user, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>
          {/* Flagged Reports */}
          <div
            className="bg-white p-6 rounded-lg"
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 className="text-lg font-bold text-black mb-6">Flagged Reports</h2>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : filteredReports.length > 0 ? (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                  >
                    <div>
                      <p className="text-gray-700 font-bold">
                        Reporter: {report.reportedBy.username}
                      </p>
                      <p className="text-gray-500">
                        Reported User: {report.reportedUser.username}
                      </p>
                      <p className="text-gray-500">Reason: {report.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No flagged reports found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
