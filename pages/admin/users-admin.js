import Navbar from "../../components/ui/navbar-admin";
import Tabs from "./tabs"; // Import the Tabs component
import { useEffect, useState } from "react";

export default function UsersAdmin() {
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

  // Fetch users from the API
  useEffect(() => {
    fetch("/api/admin/admin-user")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setFilteredUsers(data); // Initialize filtered users
        setVisibleUsers(data.slice(0, limit)); // Initially display only the first 5 users
        setOffset(limit); // Set the offset to the next batch
      })
      .catch((err) => console.error("Error fetching users:", err));
  }, []);

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

  return (
    <div className="min-h-screen bg-[#F5FDF4]">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="pt-24 px-8 flex justify-center">
        <div className="w-full max-w-4xl">
          {/* Tabs */}
          <Tabs />

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

          {/* Users List */}
          <div
            className="bg-white p-6 rounded-lg"
            style={{
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 className="text-lg font-bold text-black mb-6">Users Module</h2>
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
                          Suspension active
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
        </div>
      </div>
    </div>
  );
}
