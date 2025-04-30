// components/home/UserPostContainer.js
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import ModalDots from "../pages/home/profile/modal-dots";
import CommentModal from "../pages/home/modal-comment";
import Skeleton from "@/components/ui/skeleton";

// Truncate a description to `wordLimit` words
const truncateDescription = (text, wordLimit = 30) => {
  const words = text.trim().split(/\s+/);
  if (words.length > wordLimit) {
    return { text: words.slice(0, wordLimit).join(" "), isTruncated: true };
  }
  const trimmed = text.trim();
  return {
    text: /[.!?]$/.test(trimmed) ? trimmed : trimmed + ".",
    isTruncated: false,
  };
};

const PostSkeleton = () => (
  <div
    className="bg-white rounded-[15px] p-5 mb-4 animate-pulse"
    style={{
      width: "656px",
      boxShadow:
        "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
    }}
  >
    <div className="flex items-center mb-4">
      <Skeleton width="40px" height="40px" borderRadius="50%" />
      <div className="ml-4 flex-1">
        <Skeleton width="30%" height="16px" borderRadius="6px" className="mb-2" />
        <Skeleton width="20%" height="12px" borderRadius="6px" />
      </div>
      <Skeleton width="20px" height="20px" borderRadius="6px" />
    </div>
    <Skeleton width="100%" height="16px" borderRadius="6px" className="mb-4" />
    <Skeleton width="50%" height="16px" borderRadius="6px" className="mb-4" />
    <Skeleton width="100%" height="250px" borderRadius="15px" className="mb-4" />
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <Skeleton width="21px" height="21px" borderRadius="50%" />
        <Skeleton width="30px" height="16px" borderRadius="6px" />
        <Skeleton width="21px" height="21px" borderRadius="50%" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton width="21px" height="21px" borderRadius="50%" />
        <Skeleton width="30px" height="16px" borderRadius="6px" />
      </div>
    </div>
  </div>
);

export default function UserPostContainer({
  userId,
  activeTab,
  handleArchive,
  isCurrentUser,
}) {
  const [posts, setPosts] = useState([]);
  const [votedPosts, setVotedPosts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const [showModal, setShowModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ left: 0, top: 0 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [expandedPosts, setExpandedPosts] = useState({});
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      try {
        const archived =
          isCurrentUser && activeTab === "Archived" ? "true" : "false";
        const res = await fetch(
          `/api/post/getuserposts?archived=${archived}&userId=${userId}&limit=${limit}`
        );
        if (!res.ok) throw new Error("Fetch failed");
        const data = await res.json();
        setPosts(data);
        const votes = data.reduce((acc, p) => {
          if (p.userVote) acc[p.id] = p.userVote;
          return acc;
        }, {});
        setVotedPosts(votes);
      } catch (err) {
        console.error("Error fetching user posts:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [limit, activeTab, userId, isCurrentUser, router.pathname]);

  const handleCommentModalToggle = (post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
  };

  const handleVote = async (postId, action) => {
    try {
      const res = await fetch("/api/post/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, action }),
      });
      if (!res.ok) throw await res.json();
      const updated = await res.json();
      setVotedPosts((prev) => ({
        ...prev,
        [postId]: prev[postId] === action ? null : action,
      }));
      setPosts((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
    } catch (err) {
      console.error("Voting error:", err);
    }
  };

  if (isLoading) {
    return (
      <div>
        {[...Array(5)].map((_, i) => (
          <PostSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center text-black font-bold text-lg">
        No posts available.
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => {
        const voteState = votedPosts[post.id];
        const { text, isTruncated } = truncateDescription(post.description);
        const hasImage = !!post.image_url;
        const isExpanded = expandedPosts[post.id];

        return (
          <div
            key={post.id}
            className="bg-white rounded-[15px] shadow-lg p-5 mb-4"
            style={{
              width: "656px",
              boxShadow:
                "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            }}
          >
            <div className="flex items-center mb-4">
              <Image
                src={
                  post.user?.profile?.profile_img ||
                  "/images/default-profile.png"
                }
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-4">
                <h3
                  className="font-bold text-black cursor-pointer"
                  onClick={() =>
                    router.push(`/home/profile?userId=${post.user?.id}`)
                  }
                >
                  {post.user?.profile?.name || post.user?.username}
                </h3>
                <span className="text-black text-xs">
                  {new Date(post.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="ml-auto">
                {post.user?.id !== session?.user?.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setSelectedPost(post);
                      setModalPosition({
                        left: rect.right + window.scrollX - 10,
                        top: rect.top + window.scrollY + 18,
                      });
                      setShowModal(true);
                    }}
                  >
                    <Image
                      src="/svg/dots.svg"
                      alt="Options"
                      width={4}
                      height={16}
                    />
                  </button>
                )}
              </div>
            </div>

            <p
              onClick={() =>
                isExpanded &&
                setExpandedPosts((prev) => ({ ...prev, [post.id]: false }))
              }
              className={`text-[#4A4A4A] mb-4 break-all ${
                isExpanded ? "cursor-pointer" : ""
              }`}
            >
              {isExpanded ? (
                post.description.trim().replace(/([.!?])?$/, "$1")
              ) : isTruncated ? (
                <>
                  {text}...
                  <span
                    className="font-bold cursor-pointer hover:underline ml-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedPosts((prev) => ({
                        ...prev,
                        [post.id]: true,
                      }));
                    }}
                  >
                    See more
                  </span>
                </>
              ) : (
                text
              )}
            </p>

            {hasImage && (
              <div
                className="bg-gray-300 flex items-center justify-center rounded-lg h-[250px] mb-4 relative overflow-hidden cursor-pointer"
                onClick={() => handleCommentModalToggle(post)}
              >
                <Image
                  src={post.image_url}
                  alt="Post Image"
                  width={656}
                  height={250}
                  className="object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post.id, "DOWNVOTE");
                  }}
                  className="rounded-full p-2 hover:bg-[#f9c2c2]"
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
                    }}
                  />
                </button>
                <span className="text-black">{post.counter}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post.id, "UPVOTE");
                  }}
                  className="rounded-full p-2 hover:bg-[#DCFCE7]"
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
                    }}
                  />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => handleCommentModalToggle(post)}>
                  <Image
                    src="/svg/comments.svg"
                    alt="Comments"
                    width={21}
                    height={21}
                  />
                </button>
                <span className="text-black">{post.comments.length}</span>
              </div>
            </div>

            {showCommentModal && selectedPost?.id === post.id && (
              <CommentModal
                isOpen
                onClose={closeCommentModal}
                comments={post.comments}
                post={selectedPost}
                updateComments={(newComments) =>
                  setPosts((prev) =>
                    prev.map((p) =>
                      p.id === post.id ? { ...p, comments: newComments } : p
                    )
                  )
                }
              />
            )}
            {showModal && selectedPost?.id === post.id && (
              <ModalDots
                isOpen
                onClose={() => setShowModal(false)}
                position={modalPosition}
                postId={post.id}
                reporterId={session.user.id}
              />
            )}
          </div>
        );
      })}

      {posts.length === limit && (
        <div className="flex justify-center mt-6">
          <button
            onClick={() => setLimit((prev) => prev + 10)}
            className="font-semibold text-black"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}
