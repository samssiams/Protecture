// users-admin.js
import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs";
import { useEffect, useState } from "react";

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [visibleUsers, setVisibleUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [suspendedUsers, setSuspendedUsers] = useState({});
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const limit = 5;

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/admin-user")
      .then((res) => res.json())
      .then((data) => {
        // Ensure data is an array; if not, log error and use an empty array.
        if (!Array.isArray(data)) {
          console.error("Expected an array but received:", data);
          data = [];
        }
        setUsers(data);
        setFilteredUsers(data);

        const suspensions = {};
        data.forEach((user) => {
          if (user.suspendedUntil && new Date(user.suspendedUntil) > new Date()) {
            suspensions[user.id] = new Date(user.suspendedUntil);
          }
        });
        setSuspendedUsers(suspensions);

        const sortedUsers = [...data].sort((a, b) =>
          suspensions[b.id] ? -1 : 1
        );
        setVisibleUsers(sortedUsers.slice(0, limit));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching users:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setSuspendedUsers((prev) => {
        const updatedSuspensions = {};
        Object.entries(prev).forEach(([userId, endTime]) => {
          if (new Date(endTime) > new Date()) {
            updatedSuspensions[userId] = endTime;
          }
        });
        return updatedSuspensions;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);

    const sortedUsers = filtered.sort((a, b) =>
      suspendedUsers[b.id] ? -1 : 1
    );
    setVisibleUsers(showAllUsers ? sortedUsers : sortedUsers.slice(0, limit));
  };

  const handleSeeAll = () => {
    setShowAllUsers(true);
    setLoading(true);
    setTimeout(() => {
      setVisibleUsers(
        filteredUsers.sort((a, b) => (suspendedUsers[b.id] ? -1 : 1))
      );
      setLoading(false);
    }, 500);
  };

  const handleSuspendClick = (userId) => {
    setSelectedUserId(userId);
    setShowConfirmModal(true);
  };

  const suspendUser = () => {
    fetch("/api/admin/suspend-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUserId }),
    })
      .then((res) => res.json())
      .then(() => {
        const suspensionEndTime = new Date();
        suspensionEndTime.setHours(suspensionEndTime.getHours() + 1);

        setSuspendedUsers((prev) => ({
          ...prev,
          [selectedUserId]: suspensionEndTime,
        }));

        setShowConfirmModal(false);
        setShowSuccessModal(true);
      })
      .catch((err) => console.error("Error suspending user:", err));
  };

  const unsuspendUser = (userId) => {
    fetch("/api/admin/unsuspend-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })
      .then((res) => res.json())
      .then(() => {
        setSuspendedUsers((prev) => {
          const updated = { ...prev };
          delete updated[userId];
          return updated;
        });
      })
      .catch((err) => console.error("Error unsuspending user:", err));
  };

  const calculateRemainingTime = (endTime) => {
    const now = new Date();
    const remainingTime = endTime - now;

    if (remainingTime <= 0) {
      return null;
    }

    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="min-h-screen bg-[#F5FDF4]">
      <Navbar />

      {showConfirmModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold text-red-500 mb-4">
              Confirm Suspension
            </h2>
            <p className="text-black">
              Are you sure you want to suspend this user for 1 hour?
            </p>
            <div className="flex justify-end space-x-4 mt-4">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg font-bold hover:bg-gray-400 transition"
              >
                No
              </button>
              <button
                onClick={suspendUser}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pt-24 px-8 flex justify-center">
        <div className="w-full max-w-4xl">
          <Tabs />

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>

          <div
            className="bg-white p-6 rounded-lg relative"
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-black">Users Module</h2>
              <span
                className="text-black font-bold italic cursor-pointer hover:underline"
                onClick={handleSeeAll}
              >
                View All {filteredUsers.length}
              </span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: limit }).map((_, index) => (
                  <div key={index} className="animate-pulse flex space-x-4">
                    <div className="bg-gray-300 h-10 w-10 rounded-full"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : visibleUsers.length === 0 ? (
              <p className="text-gray-500 text-center">No user found.</p>
            ) : (
              <div className="space-y-4">
                {visibleUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                  >
                    <span className="text-gray-700">@{user.username}</span>
                    {suspendedUsers[user.id] ? (
                      <>
                        <span className="text-red-500 font-bold">
                          {calculateRemainingTime(suspendedUsers[user.id]) ||
                            "Suspension expired"}
                        </span>
                        <button
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-600 transition"
                          onClick={() => unsuspendUser(user.id)}
                        >
                          Unsuspend
                        </button>
                      </>
                    ) : (
                      <button
                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
                        onClick={() => handleSuspendClick(user.id)}
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
