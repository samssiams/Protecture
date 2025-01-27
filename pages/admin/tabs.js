import routes from "../../routes"; // Import the routes
import { useRouter } from "next/router";

export default function Tabs() {
  const router = useRouter();
  const currentPath = router.pathname;

  // Navigate to the respective route
  const navigateTo = (view) => {
    if (view === "users") {
      router.push(routes.admin.users);
    } else if (view === "flagged") {
      router.push(routes.admin.flagged);
    } else if (view === "topics") {
      router.push(routes.admin.topics);
    } else if (view === "appeal") {
      router.push(routes.admin.appeal);
    }
  };

  // Check if the tab is active
  const isActive = (path) => currentPath === path;

  return (
    <div
      className="flex items-center bg-[#EDEDED] rounded-lg overflow-hidden mb-8 shadow-md"
      style={{ padding: "2px" }}
    >
      <button
        onClick={() => navigateTo("users")}
        className={`flex-1 px-4 py-2 font-bold text-center ${
          isActive(routes.admin.users)
            ? "bg-[#E4FCDE] text-[#22C55E]"
            : "text-[#787070] hover:bg-[#E4FCDE] hover:text-[#22C55E]"
        } rounded-l-lg`}
      >
        Users
      </button>
      <button
        onClick={() => navigateTo("flagged")}
        className={`flex-1 px-4 py-2 font-bold text-center ${
          isActive(routes.admin.flagged)
            ? "bg-[#E4FCDE] text-[#22C55E]"
            : "text-[#787070] hover:bg-[#E4FCDE] hover:text-[#22C55E]"
        }`}
      >
        Flagged
      </button>
      <button
        onClick={() => navigateTo("topics")}
        className={`flex-1 px-4 py-2 font-bold text-center ${
          isActive(routes.admin.topics)
            ? "bg-[#E4FCDE] text-[#22C55E]"
            : "text-[#787070] hover:bg-[#E4FCDE] hover:text-[#22C55E]"
        }`}
      >
        Topics
      </button>
      <button
        onClick={() => navigateTo("appeal")}
        className={`flex-1 px-4 py-2 font-bold text-center ${
          isActive(routes.admin.appeal)
            ? "bg-[#E4FCDE] text-[#22C55E]"
            : "text-[#787070] hover:bg-[#E4FCDE] hover:text-[#22C55E]"
        } rounded-r-lg`}
      >
        Appeal
      </button>
    </div>
  );
}
