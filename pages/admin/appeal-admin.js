import Navbar from "../../components/ui/navbar-admin"; // Import Navbar
import Tabs from "./tabs"; // Import Tabs
import { useState } from "react";

export default function AppealAdmin() {
  const [appeals, setAppeals] = useState([
    { user: "Joexsu", reason: "Appeal: Incorrect Report" },
    { user: "Cedric", reason: "Appeal: Misunderstanding" },
  ]); // Example data
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAppeals = appeals.filter((appeal) =>
    appeal.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
    appeal.reason.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            <h2 className="text-lg font-bold text-black mb-6">Appeals Module</h2>
            <div className="space-y-4">
              {filteredAppeals.map((appeal, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
                >
                  <div>
                    <h3 className="text-black font-bold">{appeal.user}</h3>
                    <p className="text-gray-500">{appeal.reason}</p>
                  </div>
                  <div className="flex space-x-4">
                    <button className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition">
                      Reject
                    </button>
                    <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition">
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
