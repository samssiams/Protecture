import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useEffect, useState } from "react";

export default function FlaggedAdmin() {
  const [reports, setReports] = useState([]);
  const [visibleReports, setVisibleReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [offset, setOffset] = useState(0); // Offset for pagination
  const limit = 5; // Number of reports to display per page
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null); // For modal confirmation
  const [successModalVisible, setSuccessModalVisible] = useState(false); // State for success modal

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/admin/admin-flagged");
        if (!response.ok) {
          throw new Error("Failed to fetch reports");
        }
        const data = await response.json();
        setReports(data.reports);
        setVisibleReports(data.reports.slice(0, limit)); // Display first 5 reports
        setOffset(limit);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching reports:", error);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleLoadMore = () => {
    const newVisibleReports = reports.slice(0, offset + limit);
    setVisibleReports(newVisibleReports);
    setOffset(offset + limit);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = reports.filter(
      (report) =>
        report.reportedBy?.username?.toLowerCase().includes(query) ||
        report.reportedUser?.username?.toLowerCase().includes(query) ||
        report.reason?.toLowerCase().includes(query)
    );

    setVisibleReports(filtered.slice(0, limit)); // Reset visible reports
    setOffset(limit); // Reset offset
  };

  const handleSuspendPost = async (postId, reportId) => {
    if (!postId || !reportId) {
      console.error("Post ID or Report ID is undefined or invalid.");
      return;
    }

    try {
      const response = await fetch("/api/admin/suspend-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId, reportId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to suspend post");
      }

      const data = await response.json();
      console.log("Suspension successful:", data);

      setReports((prevReports) =>
        prevReports.filter((report) => report.reportId !== reportId)
      );

      setVisibleReports((prevVisibleReports) =>
        prevVisibleReports.filter((report) => report.reportId !== reportId)
      );

      setModalData(null); // Close confirmation modal
      setSuccessModalVisible(true); // Show success modal
    } catch (error) {
      console.error("Error suspending post:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5FDF4]">
      <Navbar />
      <div className="pt-24 px-8 flex justify-center">
        <div className="w-full max-w-4xl">
          <Tabs />
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search reports by reporter, reported post, or reason..."
              value={searchQuery}
              onChange={handleSearchChange}
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
            ) : visibleReports.length > 0 ? (
              <div className="space-y-4">
                {visibleReports.map((report) => (
                  <div
                    key={report.reportId}
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
                      }}
                      className="bg-red-500 text-white font-bold px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Suspend Post
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No flagged reports found.</p>
            )}
            {offset < reports.length && (
              <button
                onClick={handleLoadMore}
                className="mt-6 w-full bg-[#22C55E] text-white py-2 rounded-lg font-bold hover:bg-green-600 transition"
              >
                View More
              </button>
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
                onClick={() => setModalData(null)}
                className="px-4 py-2 bg-gray-300 rounded-md text-black font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSuspendPost(modalData.postId, modalData.reportId)}
                className="px-4 py-2 bg-red-500 text-white rounded-md font-bold"
              >
                Yes, Suspend
              </button>
            </div>
          </div>
        </div>
      )}
      {successModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg text-center">
            <h3 className="text-lg font-bold mb-4 text-green-500">Successfully Suspended Post</h3>
            <button
              onClick={() => setSuccessModalVisible(false)}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
