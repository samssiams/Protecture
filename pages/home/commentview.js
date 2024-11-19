import React from "react";
import Image from "next/image";

const CommentView = ({ comments = [] }) => {
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
              <div className="w-fit flex flex-col gap-0 rounded-[5px] bg-[#F4F3F3] border border-[#787070] px-2 py-2">
                <span className="text-black text-[14px] font-semibold block">
                  {comment?.username || "Anonymous"}
                </span>
                <span className="text-black text-[16px] font-normal">
                  {comment?.text || "No content available"}
                </span>
              </div>
              <span className="text-gray-500 text-xs mt-1 block">
                {formatTime(comment?.timestamp)}
              </span>
            </div>
          </div>
        ))
      ) : (
        <div className="text-gray-500 text-center py-2 italic mb-5">No comments</div>
      )}
    </div>
  );
};

export default CommentView;
