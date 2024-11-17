import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import CommentView from "../home/commentview";
import { useSession } from "next-auth/react";

export default function CommentModal({ isOpen, onClose, comments, post }) {
  const [commentText, setCommentText] = useState("");
  const [isPostOwner, setIsPostOwner] = useState(false);
  const commentInputRef = useRef(null);
  const modalRef = useRef(null);

  const { data: session } = useSession(); // Fetch session
  const currentUser = session?.user; // Get logged-in user's details

  useEffect(() => {
    if (isOpen) {
      commentInputRef.current.focus();
      checkPostOwnership();
    }
  }, [isOpen]);

  const checkPostOwnership = async () => {
    try {
      const response = await fetch("/api/post/downloadimage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post.id }),
      });

      const data = await response.json();
      setIsPostOwner(data.isOwner);
    } catch (error) {
      console.error("Error checking post ownership:", error);
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!commentText) return;

    try {
      const response = await fetch("/api/post/addcomment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post.id,
          commentText,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        comments.unshift(newComment);
        setCommentText("");
      } else {
        const errorData = await response.json();
        console.error("Error submitting comment:", errorData.error);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleImageDownload = () => {
    window.open(post.image_url, "_blank");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        className="bg-white rounded-[5px] shadow-lg p-4 w-[800px] relative"
        style={{
          borderRadius: "5px",
          overflow: "hidden",
          border: "2px solid black",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        ref={modalRef}
      >
        <div className="flex justify-start items-center mb-4 px-2">
          {isPostOwner && (
            <h2
              className="text-[#2FA44E] font-bold italic text-[20px] underline cursor-pointer"
              onClick={handleImageDownload}
            >
              Download Image
            </h2>
          )}
        </div>

        <div className="text-center bg-[#2C2B2B] rounded-lg mb-8 relative" style={{ height: "400px" }}>
          {post?.image_url ? (
            <Image
              src={post.image_url}
              alt="Uploaded Image"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          ) : (
            <span className="text-white text-xl font-bold italic">Uploaded Image</span>
          )}
        </div>

        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex items-center space-x-2">
            <button>
              <Image src="/svg/downvote.svg" alt="Downvote" width={21} height={21} />
            </button>
            <span className="text-black">{post?.counter || 0}</span>
            <button>
              <Image src="/svg/upvote.svg" alt="Upvote" width={21} height={21} />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button>
              <Image src="/svg/comments.svg" alt="Comments" width={21} height={21} />
            </button>
            <span className="text-black">{comments.length}</span>
          </div>
        </div>

        <hr className="border-gray-300 w-full mb-8" />

        <CommentView comments={comments} />

        <div className="flex items-center space-x-3 mb-4 px-4">
          <Image
            src={currentUser?.profileImg || "/images/user.png"}
            alt="Your Profile"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="relative flex-grow">
            <input
              type="text"
              value={commentText}
              onChange={handleCommentChange}
              ref={commentInputRef}
              className="w-full h-[41px] rounded-[5px] p-2 bg-[#F4F3F3] text-black"
              placeholder="Write something..."
              style={{
                borderRadius: "5px",
                borderColor: "787070",
                borderWidth: "1px",
                outline: "none",
              }}
            />
            <button
              onClick={handleCommentSubmit}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none"
            >
              <Image src="/svg/addcomment.svg" alt="Add Comment" width={22} height={22} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
