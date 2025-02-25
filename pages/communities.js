import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axios from "axios";
import Skeleton from "@/components/ui/skeleton";
import Link from "next/link";
import routes from "@/routes";

export default function Communities({ openCreateCommunityModal }) {
  const [communities, setCommunities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joinLoading, setJoinLoading] = useState({});
  const router = useRouter();

  // Fetch approved communities
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/community/get-community");
      if (response.status === 200) {
        setCommunities(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Failed to fetch communities.");
      console.error("Failed to fetch communities:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    fetchCommunities();
  }, []);

  // Re-fetch communities on route change (e.g., when returning from community home)
  useEffect(() => {
    const handleRouteChange = () => {
      fetchCommunities();
    };
    router.events.on("routeChangeComplete", handleRouteChange);
    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router.events]);

  // Join a community and then redirect to its home
  const joinCommunity = async (communityId) => {
    try {
      setJoinLoading((prev) => ({ ...prev, [communityId]: true }));
      const response = await axios.post("/api/community/join", { communityId });
      if (response.status === 200) {
        router.push(routes.community.home.replace("[id]", communityId));
      }
    } catch (err) {
      console.error("Error joining community:", err);
    } finally {
      setJoinLoading((prev) => ({ ...prev, [communityId]: false }));
    }
  };

  return (
    <div
      className="fixed bg-white p-4 rounded-[15px] shadow-lg right-[16rem] bottom-[19.7rem] custom-scrollbar"
      style={{
        width: "316px",
        height: "288px",
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
        overflowY: "auto",
      }}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-[18px] text-black">Communities</h2>
        <button className="text-[#22C55E] text-[15px]" onClick={openCreateCommunityModal}>
          {/* Optionally add an icon or text */}
        </button>
      </div>
      <hr className="border-t border-black w-full mb-3 mt-2" style={{ height: "1px" }} />

      {/* Create community shortcut */}
      <div
        className="flex items-center mb-3 hover:bg-[#D9D9D9] rounded-md px-3 py-1 transition-colors duration-200 cursor-pointer"
        style={{ width: "100%" }}
        onClick={openCreateCommunityModal}
      >
        <Image
          src="/svg/add.svg"
          alt="Add Community"
          width={14}
          height={14}
          className="mr-2"
          style={{ marginLeft: "-5px" }}
        />
        <span className="text-black text-[17px] font-light">Create a community</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, idx) => (
            <div key={idx} className="flex items-center justify-between px-2 py-1">
              <Skeleton width="100px" height="16px" borderRadius="6px" />
              <Skeleton width="60px" height="28px" borderRadius="6px" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul className="space-y-2 text-black">
          {communities.length === 0 ? (
            <li className="px-3 py-1 text-gray-500 italic">No communities found.</li>
          ) : (
            communities.map((community) => (
              <li
                key={community.id}
                className="flex items-center justify-between hover:bg-[#D9D9D9] rounded-md px-3 py-1 transition-colors duration-200"
                style={{ width: "100%" }}
              >
                {community.joined ? (
                  <Link
                    href={routes.community.home.replace("[id]", community.id)}
                    className="text-[16px] font-semibold"
                  >
                    p/{community.name}
                  </Link>
                ) : (
                  <span className="text-[16px] font-semibold">p/{community.name}</span>
                )}
                <div className="flex flex-col items-end">
                  {community.joined ? (
                    <button
                      className="bg-[#22C55E] text-white font-semibold text-[13px] px-3 py-1 rounded-[6px]"
                      disabled
                      style={{ boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)" }}
                    >
                      Joined
                    </button>
                  ) : (
                    <button
                      onClick={() => joinCommunity(community.id)}
                      disabled={joinLoading[community.id]}
                      className="bg-white border border-[#22C55E] text-[#22C55E] font-semibold text-[13px] px-3 py-1 rounded-[6px] hover:bg-[#22C55E] hover:text-white transition-colors duration-200"
                    >
                      {joinLoading[community.id] ? "Joining..." : "Join"}
                    </button>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      )}

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0;
        }
      `}</style>
    </div>
  );
}
