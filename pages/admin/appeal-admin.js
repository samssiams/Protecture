import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useState, useEffect } from "react";

export default function AppealAdmin() {
  const [appeals, setAppeals] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

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
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search appeals by user or reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>
          {/* Appeals List */}
          <div
            className="bg-white p-6 rounded-lg"
            style={{
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
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
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredAppeals.length > 0 ? (
                  filteredAppeals.map((appeal) => (
                    <div key={appeal.id} className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                      <div>
                        <h3 className="text-black font-bold">Suspended User: {appeal.user.username}</h3>
                        <p className="text-yellow-500 font-medium">Appeal Message: {appeal.msg}</p>
                      </div>
                      <div className="flex space-x-4">
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
                          onClick={() => handleUpdateAppeal(appeal.id, "rejected")}
                        >
                          Cancel
                        </button>
                        <button
                          className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition"
                          onClick={() => handleUpdateAppeal(appeal.id, "accepted")}
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
    </div>
  );
}
