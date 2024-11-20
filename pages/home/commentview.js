import React from "react";
import Image from "next/image";

const CommentView = ({ comments = [], onEdit, onDelete }) => {
  const formatTime = (timestamp) => {
    if (!timestamp) return "Unknown time";
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours % 12 === 0 ? 12 : hours % 12}:${String(
      minutes
    ).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
    return formattedTime;
  };

  return (
    <div className="custom-scrollbar">
      {Array.isArray(comments) && comments.length > 0 ? (
        comments.map((comment, index) => (
          <div key={index} className="flex items-start mb-4">
            <Image
              src={comment?.userImage || "/images/default-avatar.png"}
              alt={comment?.username || "Anonymous"}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="ml-3">
              <div className="w-fit flex flex-col gap-0 rounded-md bg-gray-100 border border-gray-400 px-2 py-2">
                <span className="text-black text-sm font-semibold block">
                  {comment?.username || "Anonymous"}
                </span>
                <span className="text-black text-base font-normal">
                  {comment?.text || "No content available"}
                  {comment?.edited && (
                    <span className="text-xs text-gray-500 ml-2">(Edited)</span>
                  )}
                </span>
              </div>
              <div className="flex items-center mt-1">
                <span className="text-gray-500 text-xs">
                  {formatTime(comment?.timestamp)}
                </span>
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
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center py-2 italic mb-5">
          No comments
        </div>
      )}
    </div>
  );
};

export default CommentView;
