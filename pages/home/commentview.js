import React from "react";
import Image from "next/image";

const CommentView = ({ comments }) => {
  // Placeholder comments
  const placeholderComments = [
    {
      userImage: "/images/user.svg",
      username: "User1",
      text: "Lorem ipsum",
      timestamp: "14:30",
    },
    {
      userImage: "/images/user.svg",
      username: "User2",
      text: "Lorem ipsum",
      timestamp: "14:31",
    },
    {
      userImage: "/images/user.svg",
      username: "User3",
      text: "Lorem ipsum",
      timestamp: "14:32",
    },
  ];

  // Combine passed comments and placeholders for rendering
  const allComments = comments.length > 0 ? comments : placeholderComments;

  return (
    <div className="overflow-y-auto max-h-[300px] px-4">
      {allComments.map((comment, index) => (
        <div key={index} className="flex items-start mb-4">
          <Image
            src={comment.userImage}
            alt={comment.username}
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="ml-3">
            <div
              className="rounded-[5px] bg-[#F4F3F3] border border-[#787070] px-4 py-2"
              style={{ width: "149px", height: "41px" }}
            >
              <span className="text-black text-[16px] font-normal">{comment.text}</span>
            </div>
            <span className="text-gray-500 text-xs mt-1 block">{comment.timestamp}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CommentView;
