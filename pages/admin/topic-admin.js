import Navbar from "../../components/ui/navbar-admin"; // Import Navbar
import Tabs from "./tabs"; // Import Tabs
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";

export default function TopicAdmin() {
  const { data: session, status } = useSession();
  const [communities, setCommunities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <Navbar /> {/* Navbar Component */}
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
              <p>Loading communities...</p>
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
                          onClick={() => handleManageCommunity(community.id, "REJECT")}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleManageCommunity(community.id, "APPROVE")}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition"
                        >
                          Approve
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-black">No pending community requests found.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}