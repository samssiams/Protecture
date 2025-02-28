import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useEffect, useState } from "react";

export default function FlaggedAdmin() {
  const [reports, setReports] = useState([]);
  const [visibleReports, setVisibleReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAllReports, setShowAllReports] = useState(false);
  const [loading, setLoading] = useState(true);

  const [modalData, setModalData] = useState(null);
  const [modalAction, setModalAction] = useState(null);

  // For the post preview
  const [postPreview, setPostPreview] = useState(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const limit = 5;

  // 1. Fetch reports from API on mount
  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/admin-flagged")
      .then((res) => res.json())
      .then((data) => {
        if (!data.reports || !Array.isArray(data.reports)) {
          console.error("Unexpected API response format:", data);
          setLoading(false);
          return;
        }
        const pendingReports = data.reports;
        setReports(pendingReports);
        setFilteredReports(pendingReports);
        setVisibleReports(pendingReports.slice(0, limit));
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching reports:", error);
        setLoading(false);
      });
  }, []);

  // 2. Handle search
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = reports.filter((report) =>
      report.reportedBy?.username.toLowerCase().includes(query) ||
      report.reportedUser?.username.toLowerCase().includes(query) ||
      report.reason.toLowerCase().includes(query)
    );

    setFilteredReports(filtered);
    setVisibleReports(showAllReports ? filtered : filtered.slice(0, limit));
  };

  // 3. Handle "View All" button
  const handleSeeAll = () => {
    setShowAllReports(true);
    setLoading(true);
    setTimeout(() => {
      setVisibleReports(filteredReports);
      setLoading(false);
    }, 500);
  };

  // 4. Handle confirmation modal actions (suspend or reject)
  const handleConfirmAction = async () => {
    if (!modalData) return;

    try {
      const response = await fetch("/api/admin/admin-flagged", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportId: modalData.reportId,
          action: modalAction,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Action failed");
      }

      console.log(
        `${modalAction === "suspend" ? "Post suspended" : "Report rejected"} successfully.`
      );

      // Remove the processed report from the UI
      setReports((prevReports) =>
        prevReports.filter((r) => r.reportId !== modalData.reportId)
      );
      setFilteredReports((prevFiltered) =>
        prevFiltered.filter((r) => r.reportId !== modalData.reportId)
      );
      setVisibleReports((prevVisible) =>
        prevVisible.filter((r) => r.reportId !== modalData.reportId)
      );

      setModalData(null);
      setModalAction(null);
    } catch (error) {
      console.error(
        `Error ${modalAction === "suspend" ? "suspending post" : "rejecting report"}:`,
        error
      );
    }
  };

  // 5. Handle "View" to fetch and display a single post by ID
  const handleViewPost = (report) => {
    if (!report.postId) return;

    setModalData(report);
    setModalAction("view");
    setLoadingPreview(true);

    // Call our getPostById endpoint
    fetch(`/api/post/getPostById?postId=${report.postId}`)
      .then((res) => res.json())
      .then((data) => {
        setPostPreview(data.post); // data.post has image_url and description
        setLoadingPreview(false);
      })
      .catch((err) => {
        console.error("Error fetching post preview:", err);
        setLoadingPreview(false);
      });
  };

  return (
    <div className="min-h-screen bg-[#F5FDF4]">
      <Navbar />
      <div className="pt-20 px-8 flex justify-center">
        <div className="w-full max-w-4xl">
          <Tabs />

          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search reports by reporter, reported post, or reason..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>

          {/* Reports List */}
          <div
            className="bg-white p-6 rounded-lg"
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            {/* Header with "View All" + Total Reports Count */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-black">Flagged Reports</h2>
              {filteredReports.length > limit && (
                <span
                  className="text-black font-bold italic cursor-pointer hover:underline"
                  onClick={handleSeeAll}
                >
                  View All {filteredReports.length}
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: limit }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse flex items-center justify-between bg-gray-100 p-4 rounded-lg"
                    style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                    <div className="flex space-x-3">
                      <div className="h-10 w-20 bg-gray-300 rounded"></div>
                      <div className="h-10 w-20 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleReports.length > 0 ? (
              <div className="space-y-4">
                {visibleReports.map((report) => (
                  <div
                    key={report.reportId}
                    className="flex items-center justify-between bg-gray-100 p-4 rounded-lg"
                    style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
                  >
                    <div className="flex-1">
                      <p className="text-gray-700 font-bold">
                        Reporter: {report.reportedBy?.username || "Unknown"}
                      </p>
                      <p className="text-gray-500">
                        Reported User: {report.reportedUser?.username || "Unknown"}
                      </p>
                      <p className="text-gray-500">Reason: {report.reason}</p>
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          setModalData(report);
                          setModalAction("suspend");
                        }}
                        className="bg-yellow-500 text-white font-bold px-4 py-2 rounded-md hover:bg-yellow-600"
                      >
                        Suspend Post
                      </button>
                      <button
                        onClick={() => handleViewPost(report)}
                        className="bg-green-500 text-white font-bold px-4 py-2 rounded-md hover:bg-green-600"
                      >
                        View
                      </button>
                      <button
                        onClick={() => {
                          setModalData(report);
                          setModalAction("reject");
                        }}
                        className="bg-red-500 text-white font-bold px-4 py-2 rounded-md hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-left">No flagged reports found.</p>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Modal (Suspend or Reject) */}
      {modalData && modalAction !== "view" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg text-center shadow-lg">
            <h3
              className={`text-lg font-bold mb-4 text-left ${
                modalAction === "suspend" ? "text-yellow-500" : "text-red-500"
              }`}
            >
              {modalAction === "suspend"
                ? "Confirm Suspend Post"
                : "Confirm Rejection"}
            </h3>
            <p className="mb-4 text-black">
              {modalAction === "suspend"
                ? "Are you sure you want to suspend this post?"
                : "Are you sure you want to reject this report?"}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleConfirmAction}
                className={`px-4 py-2 rounded-md font-bold transition ${
                  modalAction === "suspend"
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                Yes
              </button>
              <button
                onClick={() => {
                  setModalData(null);
                  setModalAction(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-md font-bold hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post Preview Modal */}
      {modalData && modalAction === "view" && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className="bg-white p-6 rounded-lg text-center max-w-md w-full"
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h3 className="text-lg font-bold mb-4 text-black">Post Preview</h3>
            {loadingPreview ? (
              <div className="animate-pulse space-y-4">
                <div className="w-full h-48 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            ) : postPreview ? (
              <div className="text-left">
                {postPreview.image_url && (
                  <img
                    src={postPreview.image_url}
                    alt="Post preview"
                    className="mb-4 w-full h-auto rounded"
                  />
                )}
                <p className="text-gray-700">{postPreview.description}</p>
              </div>
            ) : (
              <p className="text-gray-500">No preview available.</p>
            )}
            <div className="mt-4">
              <button
                onClick={() => {
                  setModalData(null);
                  setModalAction(null);
                  setPostPreview(null);
                }}
                className="bg-gray-500 text-white px-4 py-2 mt-2 rounded-md font-bold hover:bg-gray-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
