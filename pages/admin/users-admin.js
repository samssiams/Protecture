import Navbar from "../../components/ui/navbar-admin"; // Importing Navbar Admin
import { useState } from "react";
import FlaggedAdmin from "./flagged-admin";
import TopicAdmin from "./topic-admin";
import AppealAdmin from "./appeal-admin";

export default function UsersAdmin() {
  const [currentView, setCurrentView] = useState("users"); // Track the current view

  const handleNavigation = (view) => {
    setCurrentView(view); // Change the current view when a tab is clicked
  };

  const isActive = (view) => currentView === view;

  return (
    <div className="min-h-screen bg-[#F5FDF4]">
      {/* Navbar */}
      <Navbar />

      {/* Page Content */}
      <div className="pt-24 px-8 flex justify-center">
        <div className="w-full max-w-4xl">
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

          {/* Render Based on Current View */}
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
                <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src="/placeholder-avatar.png"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="text-gray-700">@joexsu</span>
                  </div>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition">
                    Suspend User
                  </button>
                </div>
                <div className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <img
                      src="/placeholder-avatar.png"
                      alt="User Avatar"
                      className="w-10 h-10 rounded-full"
                    />
                    <span className="text-gray-700">@joexsu</span>
                  </div>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition">
                    Suspend User
                  </button>
                </div>
              </div>
              <button className="mt-6 w-full bg-[#22C55E] text-white py-2 rounded-lg font-bold hover:bg-green-600 transition">
                View All Users
              </button>
            </div>
          )}

          {currentView === "flagged" && <FlaggedAdmin />}
          {currentView === "topics" && <TopicAdmin />}
          {currentView === "appeal" && <AppealAdmin />}
        </div>
      </div>
    </div>
  );
}
