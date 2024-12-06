// components/ui/appeal-admin.js
export default function AppealAdmin() {
    return (
      <div
        className="bg-white p-6 rounded-lg"
        style={{
          boxShadow:
            "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
        }}
      >
        <h2 className="text-lg font-bold text-black mb-6">Appeal Module</h2>
        <div className="space-y-4">
          {[
            { user: "Joexsu", reason: "Appeal: Incorrect Report" },
            { user: "Joexsu", reason: "Appeal: Misunderstanding" },
            { user: "Joexsu", reason: "Appeal: Misunderstanding" },
          ].map((appeal, index) => (
            <div
              key={index}
              className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
            >
              <div>
                <h3 className="text-black font-bold">{appeal.user}</h3>
                <span className="text-gray-700">{appeal.reason}</span>
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
        <button className="mt-6 w-full bg-[#22C55E] text-white py-2 rounded-lg font-bold hover:bg-green-600 transition">
          View All Appeal
        </button>
      </div>
    );
  }
  