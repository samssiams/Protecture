import { useState } from "react";
import ModalFlagged from "../../pages/admin/modal-admin/modal-flagged";

export default function FlaggedAdmin() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const handleOpenModal = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedUser(null);
    setIsModalOpen(false);
  };

  const handleSuspend = () => {
    console.log(`User ${selectedUser} suspended.`);
    // Add any API call or logic for suspending the user here
    handleCloseModal();
  };

  const handleDismiss = () => {
    console.log(`Report for ${selectedUser} dismissed.`);
    // Add any API call or logic for dismissing the report here
    handleCloseModal();
  };

  return (
    <div
      className="bg-white p-6 rounded-lg"
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h2 className="text-lg font-bold text-black mb-6">Flagged Users Module</h2>
      <div className="space-y-4">
        {["@joexsu", "@johndoe", "@janedoe"].map((user, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <img
                src="/placeholder-avatar.png"
                alt="User Avatar"
                className="w-10 h-10 rounded-full"
              />
              <span className="text-gray-700">{user}</span>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => handleOpenModal(user)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition"
              >
                Review
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full bg-[#22C55E] text-white py-2 rounded-lg font-bold hover:bg-green-600 transition">
        View All Report
      </button>
      {isModalOpen && (
        <ModalFlagged
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuspend={handleSuspend}
          onDismiss={handleDismiss}
          user={selectedUser}
        />
      )}
    </div>
  );
}