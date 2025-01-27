import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useEffect, useState } from "react";

export default function FlaggedAdmin() {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/admin/admin-flagged");
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await response.json();
        console.log("Fetched reports:", data.reports); // Log fetched reports
        setReports(data.reports);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSuspendPost = async (postId) => {
    console.log("Attempting to suspend post with ID:", postId); // Debugging log

    if (!postId) {
      console.error("Post ID is undefined or invalid."); // Log undefined ID error
      return;
    }

    try {
      const response = await fetch("/api/admin/suspend-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
      });

      console.log("API response status:", response.status); // Debugging log

      if (!response.ok) {
        throw new Error("Failed to suspend post");
      }

      const result = await response.json();
      console.log("API response data:", result); // Debugging log

      const updatedReports = reports.map((report) =>
        report.id === postId
          ? { ...report, status: result.post.status }
          : report
      );
      setReports(updatedReports);
      console.log("Updated reports:", updatedReports); // Debugging log
    } catch (error) {
      console.error("Error suspending post:", error); // Debugging log
    }
  };

  const filteredReports = reports.filter(
    (report) =>
      report.reportedBy?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reportedUser?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reason?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F5FDF4]">
      <Navbar />
      <div className="pt-24 px-8 flex justify-center">
        <div className="w-full max-w-4xl">
          <Tabs />
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search reports by reporter, reported user, or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>
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
                {filteredReports.map((report) => {
                  console.log("Current report object:", report); // Log report object

                  return (
                    <div
                      key={report.id}
                      className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                    >
                      <div>
                        <p className="text-gray-700 font-bold">
                          Reporter: {report.reportedBy?.username || "Unknown"}
                        </p>
                        <p className="text-gray-500">
                          Reported User: {report.reportedUser?.username || "Unknown"}
                        </p>
                        <p className="text-gray-500">Reason: {report.reason}</p>
                      </div>
                      <button
                        onClick={() => {
                          console.log("Suspend button clicked for:", report.id); // Log post ID
                          handleSuspendPost(report.id); // Pass the correct post ID
                        }}
                        className="bg-red-500 text-white font-bold px-4 py-2 rounded-md hover:bg-red-600"
                      >
                        Suspend Post
                      </button>
                    </div>
                  );
                })}
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
