import { useRouter } from "next/router";
import { useState } from "react";
import { motion } from "framer-motion";
import routes from "@/routes";

export default function Navbar() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    console.log("Logout button clicked, redirecting to login page.");
    router.push(routes.auth.login); // Redirect to login page
  };

  const handleConfirmLogout = () => {
    setShowModal(true); // Show logout confirmation modal
  };

  const handleModalClose = () => {
    setShowModal(false); // Close the modal
  };

  return (
    <div className="z-50 fixed top-0 left-0 w-full bg-white shadow-md py-1 px-8 flex justify-between items-center">
      {/* Protecture Text */}
      <span className="text-xl font-bold text-green-600">Protecture Admin</span>

      {/* Logout */}
      <a
        className="flex items-center justify-center px-5 py-3 cursor-pointer text-[#787070] hover:text-[#22C55E] transition-transform duration-300 ease-out transform hover:scale-105 rounded-full"
        onClick={handleConfirmLogout}
      >
        <span className="ml-4 text-black font-light text-[16px]">Log out</span>
      </a>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6 w-[300px] text-center"
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)", // Outer drop shadow
              filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))", // Inner shadow effect
            }}
          >
            <h2 className="text-lg font-semibold text-black mb-4">
              Are you sure you want to Logout?
            </h2>
            <div className="flex justify-around">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Yes
              </button>
              <button
                onClick={handleModalClose}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
