import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import CommentView from "./commentview";
import { useSession } from "next-auth/react";

function CommentSkeleton() {
  return (
    <div className="flex items-start mb-4 animate-pulse">
      <div className="mr-3">
        <div
          className="rounded-full bg-gray-300"
          style={{ width: "40px", height: "40px" }}
        />
      </div>
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-1" />
        <div className="h-4 bg-gray-300 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function CommentModal({
  isOpen,
  onClose,
  comments = [],
  post,
  setCommentSubmitted,
}) {
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isPostOwner, setIsPostOwner] = useState(false);
  const [showSuccessPopover, setShowSuccessPopover] = useState(false);
  const [updatedComments, setUpdatedComments] = useState(comments);
  const [warning, setWarning] = useState(null);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [voteState, setVoteState] = useState(post?.userVote);
  const [counter, setCounter] = useState(post?.counter || 0);
  const commentInputRef = useRef(null);
  const modalRef = useRef(null);
  const { data: session } = useSession();
  const currentUser = session?.user;

  const bannedWords = [
    "fuck", "fucking", "shit", "damn", "bitch", "asshole", "bastard",
    "dick", "cunt", "piss", "crap", "slut", "whore", "prick", "fag",
    "nigger", "motherfucker", "cock", "pussy", "retard", "douche",
    "bullshit", "arsehole", "wanker", "tosser", "bloody", "bugger",
    "fvck", "fck", "fcking", "mf", "dfq", "MotherFucker", "putangina",
    "gago", "tanga", "bobo", "ulol", "lintik", "hinayupak", "hayop",
    "siraulo", "tarantado", "bwisit", "tite", "pakyu", "pakyew", "leche",
    "punyeta", "inutil", "unggoy", "peste", "gunggong", "salot",
    "walanghiya", "ampota", "syet", "putcha", "punyemas", "hudas",
    "diyablo", "g@go", "8080", "kingina", "kupal", "t4nga", "b0b0",
    "shet", "obob", "bob0", "kinangina", "tangina", "hayuf", "hayf",
    "inamo", "namo",
  ];

  const containsProfanity = (text) =>
    new RegExp(`\\b(${bannedWords.join("|")})\\b`, "gi").test(text);

  const sanitizeText = (text) =>
    text.replace(
      new RegExp(`\\b(${bannedWords.join("|")})\\b`, "gi"),
      (match) => "*".repeat(match.length)
    );

  const fetchComments = useCallback(async () => {
    setCommentsLoading(true);
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
    } finally {
      setCommentsLoading(false);
    }
  }, [post?.id]);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
      setVoteState(post?.userVote);
      setCounter(post?.counter || 0);
    }
  }, [isOpen, fetchComments, post]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const checkPostOwnership = useCallback(async () => {
    try {
      const response = await fetch("/api/post/downloadimage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    const inputText = e.target.value;
    if (containsProfanity(inputText)) {
      setWarning("Your comment contains inappropriate language. It will be filtered.");
    } else {
      setWarning(null);
    }
    setCommentText(sanitizeText(inputText));
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: post?.id,
          commentText: commentText.trim(),
          commentId: editingCommentId,
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        if (editingCommentId) {
          setUpdatedComments((prevComments) =>
            prevComments.map((c) => (c.id === updatedComment.id ? updatedComment : c))
          );
        } else {
          setUpdatedComments((prevComments) => [updatedComment, ...prevComments]);
        }
        setCommentText("");
        setEditingCommentId(null);
        setShowSuccessPopover(true);
        if (setCommentSubmitted) setCommentSubmitted(true);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commentId }),
      });
      if (response.ok) {
        setUpdatedComments((prev) => prev.filter((c) => c.id !== commentId));
      } else {
        console.error("Error deleting comment:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const handleEditComment = (comment) => {
    setCommentText(comment.text);
    setEditingCommentId(comment.id);
    commentInputRef.current?.focus();
  };

  const handleImageDownload = () => {
    window.open(post?.image_url, "_blank");
  };

  const handleVote = async (action) => {
    try {
      const response = await fetch("/api/post/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, action }),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setVoteState(updatedPost.userVote);
        setCounter(updatedPost.counter);
      } else {
        console.error("Error in vote request:", await response.json());
      }
    } catch (error) {
      console.error("Error in vote request:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        ref={modalRef}
        className="bg-white rounded-[5px] shadow-lg p-4 w-[800px] relative"
        style={{
          borderRadius: "1rem",
          border: "2px solid rgba(0, 0, 0, 0.65)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1), inset 0 2px 6px rgba(0,0,0,0.2)",
          maxHeight: "90vh",
          overflowY: "auto",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-5 focus:outline-none"
        >
          <Image src="/svg/eks.svg" alt="Close" width={15} height={15} />
        </button>

        {/* Download Image Link */}
        <div className="flex justify-start items-center px-2">
          {isPostOwner && post?.image_url && (
            <h2
              className="text-[#2FA44E] font-bold italic text-[20px] underline cursor-pointer"
              onClick={handleImageDownload}
            >
              Download Image
            </h2>
          )}
        </div>

        {/* Post Image or Description */}
        <div className="relative mt-10 mb-8 rounded-lg overflow-hidden">
          {post?.image_url ? (
            <Image
              src={post.image_url}
              alt="Uploaded Image"
              layout="intrinsic"
              width={post?.imageWidth || 800}
              height={post?.imageHeight || 600}
              className="rounded-lg"
            />
          ) : (
            <div className="p-4 rounded-lg">
              <p className="text-[#4A4A4A] mb-4 pl-2">{post?.description}</p>
              {post?.category_id && (
                <p className="inline-block bg-[#DFFFD6] text-[#22C55E] text-sm font-semibold py-1 px-3 rounded-lg mb-4">
                  {post.category_id}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Votes & Comment Toggle */}
        <div className="flex justify-between items-center mb-8 px-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleVote("DOWNVOTE")}
              className="rounded-full p-2 transition-all duration-200 hover:bg-[#f9c2c2]"
            >
              <Image
                src="/svg/downvote.svg"
                alt="Downvote"
                width={21}
                height={21}
                style={{
                  filter:
                    voteState === "DOWNVOTE"
                      ? "invert(28%) sepia(73%) saturate(2574%) hue-rotate(335deg) brightness(88%) contrast(89%)"
                      : "none",
                  transition: "filter 0.2s ease-in-out",
                }}
              />
            </button>
            <span className="text-black">{counter}</span>
            <button
              onClick={() => handleVote("UPVOTE")}
              className="rounded-full p-2 transition-all duration-200 hover:bg-[#DCFCE7]"
            >
              <Image
                src="/svg/upvote.svg"
                alt="Upvote"
                width={21}
                height={21}
                style={{
                  filter:
                    voteState === "UPVOTE"
                      ? "invert(53%) sepia(81%) saturate(575%) hue-rotate(107deg) brightness(91%) contrast(92%)"
                      : "none",
                  transition: "filter 0.2s ease-in-out",
                }}
              />
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button onClick={() => { /* no-op */ }}>
              <Image
                src="/svg/comments.svg"
                alt="Comments"
                width={21}
                height={21}
              />
            </button>
            <span className="text-black">{updatedComments.length}</span>
          </div>
        </div>

        <hr className="border-gray-300 w-full mb-8" />

        {/* Comments List */}
        <div
          className="custom-scrollbar px-4"
          style={{
            maxHeight: updatedComments.length >= 2 ? "200px" : "auto",
            overflowY: updatedComments.length >= 2 ? "auto" : "visible",
          }}
        >
          {commentsLoading ? (
            [...Array(3)].map((_, idx) => <CommentSkeleton key={idx} />)
          ) : (
            <CommentView
              comments={updatedComments}
              onEdit={handleEditComment}
              onDelete={handleDeleteComment}
            />
          )}
        </div>

        {/* New Comment Input */}
        <div className="flex items-start space-x-3 mb-4 px-4">
          <Image
            src={currentUser?.profileImg || "/images/user.png"}
            alt="Your Profile"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="flex-grow relative">
            <textarea
              ref={commentInputRef}
              value={commentText}
              onChange={handleCommentChange}
              placeholder="Write something..."
              rows={3}
              className="w-full rounded-[5px] p-2 pr-10 bg-[#F4F3F3] text-black resize-none overflow-y-auto"
              style={{
                border: "1px solid #787070",
                outline: "none",
                maxHeight: "100px",
              }}
            />
            <motion.button
              onClick={handleCommentSubmit}
              whileHover={{ scale: 1.1 }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 focus:outline-none"
            >
              <Image
                src="/svg/addcomment.svg"
                alt="Add Comment"
                width={22}
                height={22}
              />
            </motion.button>
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

  /* textarea scrollbar */
  textarea {
    scrollbar-width: thin;
    scrollbar-color: #555 #f4f3f3;
  }
  textarea::-webkit-scrollbar {
    width: 2px;
  }
  textarea::-webkit-scrollbar-thumb {
    background: #555;
    border-radius: 1px;
  }
  textarea::-webkit-scrollbar-track {
    background: #f4f3f3;
  }
`}</style>

    </div>
  );
}
