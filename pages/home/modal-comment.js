import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import CommentView from "../home/commentview";
import { useSession } from "next-auth/react";

export default function CommentModal({
  isOpen,
  onClose,
  comments = [],
  post,
  setCommentSubmitted,
}) {
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null); // Track the editing state
  const [isPostOwner, setIsPostOwner] = useState(false);
  const [showSuccessPopover, setShowSuccessPopover] = useState(false);
  const [updatedComments, setUpdatedComments] = useState(comments); // State to hold updated comments
  const commentInputRef = useRef(null);
  const modalRef = useRef(null);

  const { data: session } = useSession();
  const currentUser = session?.user;

  const fetchComments = useCallback(async () => {
    try {
      const response = await fetch(`/api/post/getcomments?postId=${post?.id}`);
      if (response.ok) {
        const data = await response.json();
        setUpdatedComments(data);
      } else {
        console.error("Failed to fetch comments");
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  }, [post?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, fetchComments]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const checkPostOwnership = useCallback(async () => {
    try {
      const response = await fetch("/api/post/downloadimage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId: post?.id }),
      });

      const data = await response.json();
      setIsPostOwner(data.isOwner);
    } catch (error) {
      console.error("Error checking post ownership:", error);
    }
  }, [post?.id]);

  useEffect(() => {
    if (isOpen) {
      commentInputRef.current?.focus();
      checkPostOwnership();
    }
  }, [isOpen, checkPostOwnership]);

  const handleClickOutside = useCallback(
    (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, handleClickOutside]);

  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) return;

    try {
      const url = editingCommentId
        ? "/api/post/editcomment"
        : "/api/post/addcomment";
      const method = editingCommentId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postId: post?.id,
          commentText: commentText.trim(),
          commentId: editingCommentId, // Only for editing
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        if (editingCommentId) {
          // Update the edited comment
          setUpdatedComments((prevComments) =>
            prevComments.map((comment) =>
              comment.id === updatedComment.id ? updatedComment : comment
            )
          );
        } else {
          // Add a new comment
          setUpdatedComments((prevComments) => [
            updatedComment,
            ...prevComments,
          ]);
        }
        setCommentText("");
        setEditingCommentId(null); // Reset editing state
        setShowSuccessPopover(true);

        if (setCommentSubmitted) {
          setCommentSubmitted(true);
        }

        setTimeout(() => setShowSuccessPopover(false), 2000);
      } else {
        const errorData = await response.json();
        console.error("Error submitting comment:", errorData.error);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch("/api/post/deletecomment", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ commentId }),
      });

      if (response.ok) {
        setUpdatedComments((prevComments) =>
          prevComments.filter((comment) => comment.id !== commentId)
        );
      } else {
        console.error("Error deleting comment:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = (comment) => {
    setCommentText(comment.text); // Populate the input field with the comment text
    setEditingCommentId(comment.id); // Track the comment being edited
    commentInputRef.current?.focus(); // Focus the input field
  };

  const handleImageDownload = () => {
    window.open(post?.image_url, "_blank");
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
          boxShadow:
            "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
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

        <div
          className="relative mb-8 rounded-lg overflow-hidden"
          style={{
            width: "100%",
            height: "400px",
          }}
        >
          {post?.image_url ? (
            <Image
              src={post.image_url}
              alt="Uploaded Image"
              layout="fill"
              objectFit="cover"
              className="rounded-lg"
            />
          ) : (
            <span className="text-white text-xl font-bold italic">
              Uploaded Image
            </span>
          )}
        </div>

        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex items-center space-x-2">
            <button>
              <Image
                src="/svg/downvote.svg"
                alt="Downvote"
                width={21}
                height={21}
              />
            </button>
            <span className="text-black">{post?.counter || 0}</span>
            <button>
              <Image
                src="/svg/upvote.svg"
                alt="Upvote"
                width={21}
                height={21}
              />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button>
              <Image
                src="/svg/comments.svg"
                alt="Comments"
                width={21}
                height={21}
              />
            </button>
            <span className="text-black">{updatedComments?.length || 0}</span>
          </div>
        </div>

        <hr className="border-gray-300 w-full mb-8" />

        <div
          className="custom-scrollbar px-4"
          style={{
            maxHeight: updatedComments.length >= 2 ? "200px" : "auto",
            overflowY: updatedComments.length >= 2 ? "auto" : "visible",
          }}
        >
          <CommentView
            comments={updatedComments || []}
            onEdit={handleEditComment}
            onDelete={handleDeleteComment}
          />
        </div>

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
            <motion.div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center">
              <motion.button
                onClick={handleCommentSubmit}
                whileHover={{ scale: 1.1 }}
                className="focus:outline-none"
              >
                <Image
                  src="/svg/addcomment.svg"
                  alt="Add Comment"
                  width={22}
                  height={22}
                />
              </motion.button>
              {showSuccessPopover && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute bottom-[150%] right-0 bg-black text-white text-xs font-medium px-2 py-1 rounded shadow-md"
                >
                  Comment added!
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.div>

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
