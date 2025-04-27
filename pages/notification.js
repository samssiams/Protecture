// components/sidebar/notification.js
import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import Skeleton from "@/components/ui/skeleton";
import { createPortal } from "react-dom";

function formatMessage(msg) {
  return msg.split(" ").map((w, i) =>
    w === "You" || w === "Your" ? (
      <strong key={i} className="font-bold">
        {w}{" "}
      </strong>
    ) : (
      w + " "
    )
  );
}

export default function NotificationSidebar({ refreshTrigger }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState(null);

  /* --------------------------- FETCH DATA --------------------------- */
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/sidebar/activity");
        setNotifications(res.data || []);
      } catch (err) {
        console.error("Error fetching notifications:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [refreshTrigger]);

  /* ----------------------------- JSX ------------------------------- */
  return (
    <>
      {/* NOTIFICATION PANEL */}
      <div className="right-[16rem] flex flex-col space-y-5 fixed z-40 top-8">
        <div
          className="mt-14 bg-white p-4 rounded-[15px] shadow-lg custom-scrollbar"
          style={{
            width: "316px",
            maxHeight: "200px",
            overflowY: "auto",
            boxShadow: "0 4px 8px rgba(0,0,0,0.1), inset 0 2px 6px rgba(0,0,0,0.2)",
            border: "1px solid #E0E0E0",
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-semibold text-[18px] text-black">Notifications</h2>
          </div>
          <hr className="border-t border-black w-full mb-3" />

          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} width="100%" height="25px" borderRadius="4px" />
              ))}
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.length ? (
                notifications.map(n => {
                  const isReject = n.type === "COMMUNITY_REJECT";

                  return (
                    <li key={n.id} className="flex items-start">
                      {/* avatar */}
                      <Image
                        src={n.profileImg}
                        alt="icon"
                        width={32}
                        height={32}
                        unoptimized
                        className="rounded-full mr-2 flex-shrink-0"
                      />

                      {/* message (inline) */}
                      <span className="text-[16px] text-black leading-5">
                        {formatMessage(n.message || "")}
                        {isReject && (
                          <>
                            {" ... "}
                            <button
                              onClick={() => setSelectedNotif(n)}
                              className="text-green-600 hover:underline"
                            >
                              view
                            </button>
                          </>
                        )}
                      </span>
                    </li>
                  );
                })
              ) : (
                <p className="text-center text-gray-500">No notifications available.</p>
              )}
            </ul>
          )}
        </div>
      </div>

      {/* REASON MODAL – rendered into <body> so it covers EVERYTHING */}
      {selectedNotif &&
        typeof window !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9999]">
            <div className="bg-white p-6 rounded-lg w-80 shadow-xl">
              <h3 className="text-lg font-bold mb-4 text-black">Rejection Reason</h3>
              <p className="text-black whitespace-pre-line mb-8">
                {selectedNotif.reason || "No reason provided."}
              </p>
              <button
                onClick={() => setSelectedNotif(null)}
                className="w-full bg-green-500 text-white font-bold py-2 rounded hover:bg-green-600"
              >
                Close
              </button>
            </div>
          </div>,
          document.body
        )}

      {/* SCROLLBAR STYLE */}
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
    </>
  );
}
