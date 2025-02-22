import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";

export default function TopicAdmin() {
  const { data: session, status } = useSession();
  const [communities, setCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New state for confirmation modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [pendingAction, setPendingAction] = useState("");

  const fetchPendingCommunities = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/admin/retrieve-community-request');
      if (response.status === 200) {
        setCommunities(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch communities.");
      console.error("Failed to fetch communities:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchPendingCommunities();
    }
  }, [status]);

  // Open modal for confirmation
  const openConfirmModal = (community, action) => {
    setSelectedCommunity(community);
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const handleManageCommunity = async (communityId, action) => {
    try {
      const response = await axios.post('/api/admin/manage-community', {
        communityId,
        action,
      });

      if (response.status === 200) {
        // Remove the managed community from the list
        setCommunities(prevCommunities =>
          prevCommunities.filter(community => community.id !== communityId)
        );
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to manage community.");
      console.error("Failed to manage community:", err);
    }
  };

  const filteredCommunities = communities.filter((community) =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.owner.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // If the user is not authenticated, prompt them to sign in
  if (status === "loading") {
    return <p>Loading...</p>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5FDF4]">
        <div className="text-center">
          <p className="mb-4">You must be signed in as an admin to access this page.</p>
          <button
            onClick={() => signIn()}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

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
              placeholder="Search communities by name or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>
          {/* Error Message */}
          {error && (
            <p className="text-red-500 text-center mb-4">{error}</p>
          )}
          {/* Communities List */}
          <div
            className="bg-white p-6 rounded-lg"
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 className="text-lg font-bold text-black mb-6">Community Requests</h2>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="animate-pulse flex flex-col space-y-2">
                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-full"></div>
                    <div className="flex space-x-4 mt-2">
                      <div className="h-8 w-20 bg-gray-300 rounded"></div>
                      <div className="h-8 w-20 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCommunities.length > 0 ? (
                  filteredCommunities.map((community) => (
                    <div
                      key={community.id}
                      className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                    >
                      <div>
                        <h3 className="text-black font-bold">{community.name}</h3>
                        <p className="text-gray-500">Owner: {community.owner.username}</p>
                        <p className="text-gray-500">Description: {community.description}</p>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          onClick={() => openConfirmModal(community, "REJECT")}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => openConfirmModal(community, "APPROVE")}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-left text-gray-600">No pending community requests found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className={`text-lg font-bold mb-4 ${pendingAction === "APPROVE" ? "text-green-500" : "text-red-500"}`}>
              Confirm {pendingAction === "APPROVE" ? "Approval" : "Rejection"}
            </h2>
            <p className="mb-4 text-black">
              {pendingAction === "APPROVE"
                ? "Are you sure you want to approve this community?"
                : "Are you sure you want to reject this community?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedCommunity(null);
                  setPendingAction("");
                }}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleManageCommunity(selectedCommunity.id, pendingAction);
                  setShowConfirmModal(false);
                  setSelectedCommunity(null);
                  setPendingAction("");
                }}
                className={`px-4 py-2 rounded-lg font-bold transition ${
                  pendingAction === "APPROVE"
                    ? "bg-green-500 text-white hover:bg-green-600"
                    : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
