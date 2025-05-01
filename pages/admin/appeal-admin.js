import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useState, useEffect } from "react";

export default function AppealAdmin() {
  const [appeals, setAppeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppealId, setSelectedAppealId] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isViewLoading, setIsViewLoading] = useState(false);
  const [viewDetails, setViewDetails] = useState({
    reason: "",
    reportedBy: "Unknown",
    post: null,
  });

  const fetchAppeals = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admin-appeal");
      const data = await res.json();
      setAppeals(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppeals();
  }, []);

  const handleUpdateAppeal = async (id, newStatus) => {
    try {
      const res = await fetch("/api/admin/admin-appeal", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchAppeals();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const confirmAccept = (id) => {
    setSelectedAppealId(id);
    setShowAcceptModal(true);
  };

  const confirmCancel = (id) => {
    setSelectedAppealId(id);
    setShowCancelModal(true);
  };

  const handleConfirmAccept = () => {
    if (selectedAppealId) {
      handleUpdateAppeal(selectedAppealId, "accepted");
    }
    setShowAcceptModal(false);
    setSelectedAppealId(null);
  };

  const handleConfirmCancel = () => {
    if (selectedAppealId) {
      handleUpdateAppeal(selectedAppealId, "rejected");
    }
    setShowCancelModal(false);
    setSelectedAppealId(null);
  };

  const handleCancelAccept = () => {
    setShowAcceptModal(false);
    setSelectedAppealId(null);
  };

  const handleCancelCancel = () => {
    setShowCancelModal(false);
    setSelectedAppealId(null);
  };

  const handleViewReason = async (username) => {
    setIsViewLoading(true);
    try {
      const res = await fetch(
        `/api/user/get-report-reason?username=${encodeURIComponent(username)}`
      );
      if (res.ok) {
        const data = await res.json();
        setViewDetails({
          reason: data.reason || "redundant",
          reportedBy: data.reportedBy || "Unknown",
          post: data.post || null,
        });
      } else {
        setViewDetails({
          reason: "redundant",
          reportedBy: "Unknown",
          post: null,
        });
      }
    } catch (error) {
      console.error("Error fetching report reason:", error);
      setViewDetails({
        reason: "Error fetching reason.",
        reportedBy: "Unknown",
        post: null,
      });
    } finally {
      setIsViewLoading(false);
      setShowViewModal(true);
    }
  };

  const filteredAppeals = appeals.filter((appeal) =>
    appeal.user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appeal.msg.toLowerCase().includes(searchQuery.toLowerCase())
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
              placeholder="Search appeals by user or reason..."
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
            <h2 className="text-lg font-bold text-black mb-6">Appeals Module</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    </div>
                    <div className="flex space-x-4">
                      <div className="h-8 w-20 bg-gray-300 rounded"></div>
                      <div className="h-8 w-20 bg-gray-300 rounded"></div>
                      <div className="h-8 w-20 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppeals.length > 0 ? (
                  filteredAppeals.map((appeal) => (
                    <div
                      key={appeal.id}
                      className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                    >
                      <div>
                        <h3 className="text-black font-bold">
                          Suspended User: {appeal.user.username}
                        </h3>
                        <p className="text-yellow-500 font-medium">
                          Appeal Message: {appeal.msg}
                        </p>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                          onClick={() => handleViewReason(appeal.user.username)}
                        >
                          View
                        </button>
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
                          onClick={() => confirmCancel(appeal.id)}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition"
                          onClick={() => confirmAccept(appeal.id)}
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-left text-gray-600">No pending appeals found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accept Confirmation Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold text-green-600 mb-4 text-center">
              Confirm Appeal Acceptance
            </h2>
            <p className="text-black text-center">
              Are you sure you want to accept this appeal?
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={handleCancelAccept}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
              >
                No
              </button>
              <button
                onClick={handleConfirmAccept}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg font-bold text-red-600 mb-4 text-center">
              Confirm Appeal Cancellation
            </h2>
            <p className="text-black text-center">
              Are you sure you want to cancel (reject) this appeal?
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={handleCancelCancel}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
              >
                No
              </button>
              <button
                onClick={handleConfirmCancel}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Suspension & Post Details Modal */}
      {showViewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div
            className="bg-white p-6 rounded-lg text-center w-80"
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 className="text-lg font-bold text-black text-center mb-4">
              Suspension Details
            </h2>
            {isViewLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-left text-gray-700">
                {viewDetails.post && (
                  <div>
                    <span className="font-bold">Reported Post:</span>
                    <p className="mt-2">
                      Description: {viewDetails.post.description}
                    </p>
                    {viewDetails.post.image_url && (
                      <img
                        src={viewDetails.post.image_url}
                        alt="Post Image"
                        className="mt-2 max-w-full h-auto rounded-md"
                      />
                    )}
                    <p className="mt-2">
                      Posted At:{" "}
                      {new Date(
                        viewDetails.post.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <span className="font-bold">Reason: </span>
                  {viewDetails.reason}
                </div>
                <div>
                  <span className="font-bold">Reported By: </span>
                  {viewDetails.reportedBy}
                </div>
              </div>
            )}
            <div className="mt-8">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setViewDetails({
                    reason: "",
                    reportedBy: "Unknown",
                    post: null,
                  });
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 transition"
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
