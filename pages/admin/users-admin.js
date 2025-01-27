import Navbar from "../../components/ui/navbar-admin";
import { useEffect, useState } from "react";

export default function UsersAdmin() {
  const [currentView, setCurrentView] = useState("users"); // Track the current view
  const [users, setUsers] = useState([]); // State for all users
  const [visibleUsers, setVisibleUsers] = useState([]); // State for users currently displayed
  const [filteredUsers, setFilteredUsers] = useState([]); // State for filtered users
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [offset, setOffset] = useState(0); // Offset for pagination
  const limit = 5; // Number of users to display per page
  const [showConfirmModal, setShowConfirmModal] = useState(false); // Confirmation modal visibility
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Success modal visibility
  const [selectedUserId, setSelectedUserId] = useState(null); // Store the user ID to be suspended
  const [suspendedUsers, setSuspendedUsers] = useState({}); // Track suspended users with remaining time

  // Fetch users from the API when the "users" tab is active
  useEffect(() => {
    if (currentView === "users") {
      fetch("/api/admin/admin-user")
        .then((res) => res.json())
        .then((data) => {
          setUsers(data);
          setFilteredUsers(data); // Initialize filtered users
          setVisibleUsers(data.slice(0, limit)); // Initially display only the first 5 users
          setOffset(limit); // Set the offset to the next batch
        })
        .catch((err) => console.error("Error fetching users:", err));
    }
  }, [currentView]);

  // Handle loading more users
  const handleLoadMore = () => {
    const newVisibleUsers = filteredUsers.slice(0, offset + limit);
    setVisibleUsers(newVisibleUsers);
    setOffset(offset + limit);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    // Filter users by search query
    const filtered = users.filter((user) =>
      user.username.toLowerCase().includes(query)
    );

    setFilteredUsers(filtered);
    setVisibleUsers(filtered.slice(0, limit)); // Reset visible users based on filtered results
    setOffset(limit); // Reset offset
  };

  // Show confirmation modal
  const handleSuspendClick = (userId) => {
    setSelectedUserId(userId);
    setShowConfirmModal(true);
  };

  // Handle suspending a user
  const suspendUser = () => {
    fetch("/api/admin/suspend-user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selectedUserId }),
    })
      .then((res) => res.json())
      .then(() => {
        const suspensionEndTime = new Date();
        suspensionEndTime.setHours(suspensionEndTime.getHours() + 1); // Suspend for 1 hour

        setSuspendedUsers((prev) => ({
          ...prev,
          [selectedUserId]: suspensionEndTime,
        }));

        setShowConfirmModal(false); // Close the confirmation modal
        setShowSuccessModal(true); // Show the success modal
      })
      .catch((err) => console.error("Error suspending user:", err));
  };

  // Handle unsuspending a user
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

  // Timer countdown for suspended users
  const calculateRemainingTime = (endTime) => {
    const now = new Date();
    const remainingTime = new Date(endTime) - now;

    if (remainingTime <= 0) {
      return null; // Suspension expired
    }

    const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((remainingTime % (1000 * 60)) / 1000);

    return `${minutes}m ${seconds}s`;
  };

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

  const handleNavigation = (view) => setCurrentView(view); // Change the current view
  const isActive = (view) => currentView === view; // Check if a tab is active

  return (
    <div className="min-h-screen bg-[#F5FDF4]">
      {/* Navbar */}
      <Navbar />

      {/* Confirmation Modal */}
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-lg font-bold text-green-500 mb-4">Success</h2>
            <p className="text-black">
              The user has been successfully suspended for 1 hour.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="mt-4 bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div className="pt-24 px-8 flex justify-center">
        <div className="w-full max-w-4xl">
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search users by username..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-gray-500"
            />
          </div>

          {/* Tabs */}
          <div
            className="flex items-center bg-[#EDEDED] rounded-lg overflow-hidden mb-8 shadow-md"
            style={{ padding: "2px" }}
          >
            <button
              onClick={() => handleNavigation("users")}
              className={`flex-1 px-4 py-2 font-bold text-center ${
                isActive("users")
                  ? "bg-[#E4FCDE] text-[#22C55E]"
                  : "text-[#787070] hover:bg-[#E4FCDE] hover:text-[#22C55E]"
              } rounded-l-lg`}
            >
              Users
            </button>
            <button
              onClick={() => handleNavigation("flagged")}
              className={`flex-1 px-4 py-2 font-bold text-center ${
                isActive("flagged")
                  ? "bg-[#E4FCDE] text-[#22C55E]"
                  : "text-[#787070] hover:bg-[#E4FCDE] hover:text-[#22C55E]"
              }`}
            >
              Flagged
            </button>
            <button
              onClick={() => handleNavigation("topics")}
              className={`flex-1 px-4 py-2 font-bold text-center ${
                isActive("topics")
                  ? "bg-[#E4FCDE] text-[#22C55E]"
                  : "text-[#787070] hover:bg-[#E4FCDE] hover:text-[#22C55E]"
              }`}
            >
              Topics
            </button>
            <button
              onClick={() => handleNavigation("appeal")}
              className={`flex-1 px-4 py-2 font-bold text-center ${
                isActive("appeal")
                  ? "bg-[#E4FCDE] text-[#22C55E]"
                  : "text-[#787070] hover:bg-[#E4FCDE] hover:text-[#22C55E]"
              } rounded-r-lg`}
            >
              Appeal
            </button>
          </div>

          {/* Render Content Based on Current View */}
          {currentView === "users" && (
            <div
              className="bg-white p-6 rounded-lg"
              style={{
                boxShadow:
                  "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
              }}
            >
              <h2 className="text-lg font-bold text-black mb-6">
                Users Module
              </h2>
              <div className="space-y-4">
                {visibleUsers.length > 0 ? (
                  visibleUsers.map((user) => (
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
                            Unsuspend User
                          </button>
                        </>
                      ) : (
                        <button
                          className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
                          onClick={() => handleSuspendClick(user.id)}
                        >
                          Suspend User
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-700">No users available.</p>
                )}
              </div>
              {offset < filteredUsers.length && (
                <button
                  className="mt-6 w-full bg-[#22C55E] text-white py-2 rounded-lg font-bold hover:bg-green-600 transition"
                  onClick={handleLoadMore}
                >
                  View All Users
                </button>
              )}
            </div>
          )}

          {currentView === "flagged" && <div>Flagged View Placeholder</div>}
          {currentView === "topics" && <div>Topics View Placeholder</div>}
          {currentView === "appeal" && <div>Appeal View Placeholder</div>}
        </div>
      </div>
    </div>
  );
}
