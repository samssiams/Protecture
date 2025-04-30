import React, { useState } from "react";
import Image from "next/image";

const truncateDescription = (text, wordLimit = 20) => {
  const words = text.trim().split(/\s+/);
  if (words.length > wordLimit) {
    const truncatedText = words.slice(0, wordLimit).join(" ");
    return { text: truncatedText, isTruncated: true };
  }
  const trimmed = text.trim();
  return {
    text: /[.!?]$/.test(trimmed) ? trimmed : trimmed + ".",
    isTruncated: false,
  };
};

const CommentView = ({ comments = [], onEdit, onDelete }) => {
  const [expandedComments, setExpandedComments] = useState({});

  const toggleExpand = (id) => {
    setExpandedComments(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours % 12 === 0 ? 12 : hours % 12}:` +
           `${String(minutes).padStart(2, "0")} ` +
           `${hours >= 12 ? "PM" : "AM"}`;
  };

  const sanitizeText = (text) => {
    if (!text) return "No content available";
    const bannedWords = [
      "fuck", "fucking", "shit", "damn", "bitch", "asshole", "bastard",
    ];
    const regex = new RegExp(`\\b(${bannedWords.join("|")})\\b`, "gi");
    return text.replace(regex, match => "*".repeat(match.length));
  };

  return (
    <div className="custom-scrollbar">
      {Array.isArray(comments) && comments.length > 0 ? (
        comments.map(comment => {
          const raw = comment?.text || "";
          const clean = sanitizeText(raw);
          const { text: preview, isTruncated } = truncateDescription(clean, 20);
          const isExpanded = !!expandedComments[comment.id];
          const displayText = isExpanded ? clean : preview;

          return (
            <div key={comment.id} className="flex items-start mb-4">
              <Image
                src={comment?.userImage || "/images/default-avatar.png"}
                alt={comment?.username || "Anonymous"}
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-3">
                <div
                  className={`w-fit flex flex-col gap-0 rounded-md bg-gray-100 border border-gray-400 px-2 py-2
                    ${isExpanded ? "max-h-40 overflow-y-auto custom-scrollbar" : ""}`}
                >
                  <span className="text-black text-sm font-semibold block">
                    {comment?.username || "Anonymous"}
                  </span>
                  <span
                    className={`text-[#4A4A4A] text-base font-normal ${
                      isExpanded ? "cursor-pointer" : ""
                    }`}
                    onClick={isExpanded ? () => toggleExpand(comment.id) : undefined}
                  >
                    {displayText}
                    {!isExpanded && isTruncated && (
                      <span
                        className="inline text-sm cursor-pointer ml-1"
                        onClick={() => toggleExpand(comment.id)}
                      >
                        <span className="font-normal">... </span>
                        <span className="font-bold">See more</span>
                      </span>
                    )}
                    {comment?.edited && (
                      <span className="inline text-xs text-gray-500 ml-1">
                        (edited)
                      </span>
                    )}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-gray-500 text-xs">
                    {formatTime(comment?.timestamp)}
                  </span>
                  {comment.isCurrentUser && (
                    <>
                      <button
                        className="text-gray-500 text-xs ml-3 hover:underline"
                        onClick={() => onEdit(comment)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-gray-500 text-xs ml-3 hover:underline"
                        onClick={() => onDelete(comment.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })
      ) : (
        <div className="text-gray-500 text-center py-2 italic mb-5">
          No comments
        </div>
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
};

export default CommentView;
