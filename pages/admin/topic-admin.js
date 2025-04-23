// pages/admin/topic-admin.js
import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useState, useEffect } from "react";
import axios from "axios";
import { useSession, signIn } from "next-auth/react";

export default function TopicAdmin() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState("REQUEST");

  const [pendingCommunities, setPending] = useState([]);
  const [activeCommunities, setActive] = useState([]);
  const [inactiveCommunities, setInactive] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [pendingVisibleCount, setPendingVisibleCount] = useState(5);
  const [activeVisibleCount, setActiveVisibleCount] = useState(5);
  const [inactiveVisibleCount, setInactiveVisibleCount] = useState(5);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [pendingAction, setPendingAction] = useState("");

  const fetchPending = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/retrieve-community-request");
      setPending(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch pending communities.");
    } finally {
      setLoading(false);
    }
  };

  const fetchActive = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/retrieve-active-communities");
      setActive(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch active communities.");
    } finally {
      setLoading(false);
    }
  };

  const fetchInactive = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/admin/retrieve-inactive-communities");
      setInactive(data);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch inactive communities.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status !== "authenticated") return;
    setError(null);
    setPendingVisibleCount(5);
    setActiveVisibleCount(5);
    setInactiveVisibleCount(5);

    if (activeTab === "REQUEST") fetchPending();
    else if (activeTab === "ACTIVE") fetchActive();
    else if (activeTab === "INACTIVE") fetchInactive();
  }, [status, activeTab]);

  if (status === "loading") return <p>Loading…</p>;
  if (status === "unauthenticated")
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

  const openConfirmModal = (community, action) => {
    setSelectedCommunity(community);
    setPendingAction(action);
    setShowConfirmModal(true);
  };

  const handleManage = async (id, action) => {
    try {
      await axios.post("/api/admin/manage-community", { communityId: id, action });
      if (action === "APPROVE" || action === "REJECT") {
        setPending(p => p.filter(c => c.id !== id));
      } else if (action === "ARCHIVE") {
        setActive(a => a.filter(c => c.id !== id));
        setInactive(i => i.concat(selectedCommunity));
      }
    } catch {
      setError("Failed to manage community.");
    }
  };

  const filterFn = arr =>
    arr.filter(
      c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.owner.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const filteredPending  = filterFn(pendingCommunities);
  const filteredActive   = filterFn(activeCommunities);
  const filteredInactive = filterFn(inactiveCommunities);

  return (
    <div className="min-h-screen bg-[#F5FDF4]">
      <Navbar />
      <div className="pt-24 px-8 flex justify-center">
        <div className="w-full max-w-4xl">
          <Tabs />

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search communities by name or owner..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <div
            className="bg-white p-6 rounded-lg"
            style={{ boxShadow: "0 4px 8px rgba(0,0,0,0.1), inset 0 2px 6px rgba(0,0,0,0.2)" }}
          >
            <div className="flex space-x-4 mb-6 border-b">
              {["REQUEST","ACTIVE","INACTIVE"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 font-semibold transition ${
                    activeTab === tab
                      ? "border-b-2 border-green-500 text-green-500"
                      : "text-gray-600"
                  }`}
                >
                  {tab.charAt(0)+tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {activeTab === "REQUEST" && (
              <>
                <h2 className="text-lg font-bold mb-4 text-black">Community Requests</h2>
                {loading ? (
                  Array.from({ length: 5 }).map((_,i) => (
                    <div key={i} className="bg-gray-100 p-4 rounded-lg mb-4 animate-pulse flex flex-col relative">
                      <div className="absolute top-4 right-4 h-4 w-12 bg-gray-300 rounded"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                      <div className="mt-auto flex space-x-4">
                        <div className="h-8 w-20 bg-gray-300 rounded"></div>
                        <div className="h-8 w-20 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : filteredPending.length ? (
                  filteredPending.slice(0,pendingVisibleCount).map(c => (
                    <div key={c.id} className="bg-gray-100 p-4 rounded-lg mb-4 flex flex-col relative">
                      <div className="absolute top-4 right-4">
                        <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                          Request
                        </span>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-black font-bold">{c.name}</h3>
                        <p className="text-gray-500 mb-1">
                          <span className="font-semibold">Owner: </span>{c.owner.username}
                        </p>
                        <p className="text-gray-500 mb-1">
                          <span className="font-semibold">Description: </span>{c.description}
                        </p>
                        <p className="text-gray-500">
                          <span className="font-semibold">Created: </span>
                          {`${new Date(c.createdAt).getMonth()+1}-${new Date(c.createdAt).getDate()}-${new Date(c.createdAt).getFullYear()}`}
                        </p>
                      </div>
                      <div className="mt-auto flex space-x-4">
                        <button
                          onClick={() => openConfirmModal(c,"APPROVE")}
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600"
                        >Approve</button>
                        <button
                          onClick={() => openConfirmModal(c,"REJECT")}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600"
                        >Reject</button>
                      </div>
                    </div>
                  ))
                ) : <p className="text-gray-600">No request community found</p>}
                {filteredPending.length > pendingVisibleCount && (
                  <button
                    onClick={() => setPendingVisibleCount(n => n + 5)}
                    className="w-full text-center py-2 text-black font-semibold"
                  >Load More</button>
                )}
              </>
            )}

            {activeTab === "ACTIVE" && (
              <>
                <h2 className="text-lg font-bold mb-4 text-black">Active Communities</h2>
                {loading ? (
                  Array.from({ length: 5 }).map((_,i) => (
                    <div key={i} className="bg-gray-100 p-4 rounded-lg mb-4 animate-pulse flex flex-col relative">
                      <div className="absolute top-4 right-4 h-4 w-12 bg-gray-300 rounded"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                      <div className="mt-auto flex">
                        <div className="h-8 w-20 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : filteredActive.length ? (
                  filteredActive.slice(0,activeVisibleCount).map(c => {
                    const sevenDaysAgo = Date.now() - 7*24*60*60*1000;
                    const lastActivity = c.lastPostAt
                      ? new Date(c.lastPostAt).getTime()
                      : new Date(c.updatedAt).getTime();
                    const isStale = lastActivity < sevenDaysAgo;

                    return (
                      <div key={c.id} className="bg-gray-100 p-4 rounded-lg mb-4 flex flex-col relative">
                        <div className="absolute top-4 right-4 flex space-x-2">
                          <span className="text-sm font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-lg">
                            Active
                          </span>
                          {isStale && (
                            <span className="text-sm font-semibold text-yellow-800 bg-yellow-100 px-2 py-1 rounded-lg">
                              ⚠️ No posts in 7d
                            </span>
                          )}
                        </div>
                        <div className="mb-4">
                          <h3 className="text-black font-bold">{c.name}</h3>
                          <p className="text-gray-500 mb-1">
                            <span className="font-semibold">Owner: </span>{c.owner.username}
                          </p>
                          <p className="text-gray-500 mb-1">
                            <span className="font-semibold">Description: </span>{c.description}
                          </p>
                          <p className="text-gray-500 mb-1">
                            <span className="font-semibold">Members: </span>{c.members.length}
                          </p>
                          <p className="text-gray-500">
                            <span className="font-semibold">Created: </span>
                            {`${new Date(c.createdAt).getMonth()+1}-${new Date(c.createdAt).getDate()}-${new Date(c.createdAt).getFullYear()}`}
                          </p>
                        </div>
                        <div className="mt-auto flex">
                          <button
                            onClick={() => openConfirmModal(c,"ARCHIVE")}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600"
                          >Archive</button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-gray-600">No active community found</p>
                )}
                {filteredActive.length > activeVisibleCount && (
                  <button
                    onClick={() => setActiveVisibleCount(n => n + 5)}
                    className="w-full text-center py-2 text-black font-semibold"
                  >Load More</button>
                )}
              </>
            )}

            {activeTab === "INACTIVE" && (
              <>
                <h2 className="text-lg font-bold mb-4 text-black">Inactive Communities</h2>
                {loading ? (
                  Array.from({ length: 5 }).map((_,i) => (
                    <div key={i} className="bg-gray-100 p-4 rounded-lg mb-4 animate-pulse flex flex-col relative">
                      <div className="absolute top-4 right-4 h-4 w-12 bg-gray-300 rounded"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                      <div className="mt-auto flex">
                        <div className="h-8 w-20 bg-gray-300 rounded"></div>
                      </div>
                    </div>
                  ))
                ) : filteredInactive.length ? (
                  filteredInactive.slice(0,inactiveVisibleCount).map(c => (
                    <div key={c.id} className="bg-gray-100 p-4 rounded-lg mb-4 flex flex-col relative">
                      <div className="absolute top-4 right-4">
                        <span className="text-sm font-semibold text-white bg-red-500 px-2 py-1 rounded-lg">
                          Inactive
                        </span>
                      </div>
                      <div className="mb-4">
                        <h3 className="text-black font-bold">{c.name}</h3>
                        <p className="text-gray-500 mb-1">
                          <span className="font-semibold">Owner: </span>{c.owner.username}
                        </p>
                        <p className="text-gray-500 mb-1">
                          <span className="font-semibold">Description: </span>{c.description}
                        </p>
                        <p className="text-gray-500 mb-1">
                          <span className="font-semibold">Members: </span>{c.members.length}
                        </p>
                        <p className="text-gray-500">
                          <span className="font-semibold">Created: </span>
                          {`${new Date(c.createdAt).getMonth()+1}-${new Date(c.createdAt).getDate()}-${new Date(c.createdAt).getFullYear()}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-600">No inactive community found</p>
                )}
                {filteredInactive.length > inactiveVisibleCount && (
                  <button
                    onClick={() => setInactiveVisibleCount(n => n + 5)}
                    className="w-full text-center py-2 text-black font-semibold"
                  >Load More</button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-black">
              {pendingAction === "ARCHIVE"
                ? "Confirm Archive"
                : pendingAction === "APPROVE"
                ? "Confirm Approval"
                : "Confirm Rejection"}
            </h2>
            <p className="text-black mb-4">
              {pendingAction === "ARCHIVE"
                ? "Are you sure you want to archive this community?"
                : pendingAction === "APPROVE"
                ? "Are you sure you want to approve this community?"
                : "Are you sure you want to reject this community?"}
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleManage(selectedCommunity.id, pendingAction);
                  setShowConfirmModal(false);
                }}
                className={`px-4 py-2 rounded-lg font-bold ${
                  pendingAction === "ARCHIVE"
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : pendingAction === "APPROVE"
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
