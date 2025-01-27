import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useEffect, useState } from "react";

export default function FlaggedAdmin() {
  const [reports, setReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null); // For modal confirmation

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/admin/admin-flagged");
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await response.json();

        // Log the postId for each report
        data.reports.forEach((report, index) => {
          console.log(`Report ${index + 1} - Post ID:`, report.postId);
        });

        setReports(data.reports);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSuspendPost = async (postId, reportId) => {
    // Log both postId and reportId for debugging
    console.log(`postId: ${postId}, reportId: ${reportId}`);

    if (!postId || !reportId) {
      console.error("Post ID or Report ID is undefined or invalid."); // Log undefined ID error
      return;
    }

    try {
      const response = await fetch("/api/admin/suspend-post", { // Updated endpoint
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, reportId }), // Send both postId and reportId
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to suspend user");
      }

      const data = await response.json();

      console.log("Suspension successful:", data); // Log success

      // Remove the report from the list after successful suspension
      setReports((prevReports) =>
        prevReports.filter((report) => report.reportId !== reportId)
      );

      setModalData(null); // Close modal
    } catch (error) {
      console.error("Error suspending post:", error); // Log any errors
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
                {filteredReports.map((report, index) => (
                  <div
                    key={report.reportId} // Use reportId as key
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
                        setModalData(report);
                      }} // Open modal with report data
                      className="bg-red-500 text-white font-bold px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Suspend User
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No flagged reports found.</p>
            )}
          </div>
        </div>
      </div>
      {modalData && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-lg font-medium mb-4 text-black">Are you sure?</h3>
            <p className="text-black font-medium">
              Do you want to suspend the user "{modalData.reportedUser?.username || "Unknown"}"?
            </p>
            <div className="mt-4 flex justify-end space-x-4">
              <button
                onClick={() => {
                  setModalData(null);
                }} // Close modal
                className="px-4 py-2 bg-gray-300 rounded-md text-black font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleSuspendPost(modalData.postId, modalData.reportId); // Pass both postId and reportId
                }} // Suspend user
                className="px-4 py-2 bg-red-500 text-white rounded-md font-bold"
              >
                Yes, Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
