import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { createPortal } from "react-dom";
import ModalDots from "../../pages/home/profile/modal-dots";
import CommentModal from "../../pages/home/modal-comment";
import Skeleton from "@/components/ui/skeleton";

function PostSkeleton() {
  return (
    <div
      className="bg-white rounded-[15px] shadow-lg p-5 mb-4 animate-pulse"
      style={{
        width: "656px",
        boxShadow:
          "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
      }}
    >
      <div className="flex items-center mb-4">
        <Skeleton width="40px" height="40px" borderRadius="50%" />
        <div className="ml-4 flex-1">
          <Skeleton
            width="30%"
            height="16px"
            borderRadius="6px"
            className="mb-2"
          />
          <Skeleton width="20%" height="12px" borderRadius="6px" />
        </div>
        <Skeleton width="20px" height="20px" borderRadius="6px" />
      </div>
      <Skeleton
        width="100%"
        height="16px"
        borderRadius="6px"
        className="mb-4"
      />
      <Skeleton width="50%" height="16px" borderRadius="6px" className="mb-4" />
      <Skeleton
        width="100%"
        height="250px"
        borderRadius="15px"
        className="mb-4"
      />
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
}

function CommunityPostContainer({ communityId }) {
  const [posts, setPosts] = useState([]);
  const [votedPosts, setVotedPosts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ left: 0, top: 0 });
  const [selectedPost, setSelectedPost] = useState(null);
  const { data: session } = useSession();
  const router = useRouter();

  // Initial fetch for community posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const query = `?communityId=${communityId}`;
        const response = await fetch(`/api/post/getcommunityposts${query}`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);
          const initialVotes = data.reduce((acc, post) => {
            if (post.userVote) {
              acc[post.id] = post.userVote;
            }
            return acc;
          }, {});
          setVotedPosts(initialVotes);
        } else {
          console.error("Error fetching community posts");
        }
      } catch (error) {
        console.error("Error fetching community posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (communityId) {
      fetchPosts();
    }
  }, [communityId]);

  // Poll for updated community posts every 10 seconds
  useEffect(() => {
    if (communityId) {
      const fetchUpdatedCommunityPosts = async () => {
        try {
          const query = `?communityId=${communityId}`;
          const response = await fetch(`/api/post/getcommunityposts${query}`);
          if (response.ok) {
            const data = await response.json();
            setPosts(data);
            const initialVotes = data.reduce((acc, post) => {
              if (post.userVote) {
                acc[post.id] = post.userVote;
              }
              return acc;
            }, {});
            setVotedPosts(initialVotes);
          } else {
            console.error("Error fetching community posts during polling");
          }
        } catch (error) {
          console.error(
            "Error fetching community posts during polling:",
            error
          );
        }
      };

      const intervalId = setInterval(fetchUpdatedCommunityPosts, 10000);
      return () => clearInterval(intervalId);
    }
  }, [communityId]);

  const handleModalToggle = (event, post) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position = {
      left: rect.left + window.scrollX,
      top: rect.bottom + window.scrollY + 5,
    };
    setSelectedPost(post);
    setModalPosition(position);
    setShowModal((prev) => !prev);
  };

  const handleCommentModalToggle = (post) => {
    setSelectedPost(post);
    setShowCommentModal(true);
  };

  const closeCommentModal = () => {
    setShowCommentModal(false);
  };

  const handleVote = async (postId, action) => {
    try {
      const requestBody = { postId, action };
      const response = await fetch("/api/post/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      if (response.ok) {
        const updatedPost = await response.json();
        setVotedPosts((prevVotes) => ({
          ...prevVotes,
          [postId]: prevVotes[postId] === action ? null : action,
        }));
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === updatedPost.id ? updatedPost : post
          )
        );
      } else {
        const errorData = await response.json();
        console.error("Error in vote request:", errorData);
      }
    } catch (error) {
      console.error("Error in vote request:", error);
    }
  };

  if (isLoading) {
    return (
      <div>
        {[...Array(5)].map((_, idx) => (
          <PostSkeleton key={idx} />
        ))}
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="text-center text-gray-600 font-bold">
        No community posts yet...
      </div>
    );
  }

  return (
    <div>
      {posts.map((post) => {
        // Log the user id of each post
        console.log("Post user id:", post.user?.id);

        const voteState = votedPosts[post.id];
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
                  onClick={async () => {
                    const userId = post.user?.id;
                    try {
                      const response = await fetch(
                        `/api/user/getUser?userId=${userId}`
                      );
                      if (response.ok) {
                        const userData = await response.json();
                        // Use userData as needed
                      } else {
                        console.error("Failed to fetch user data");
                      }
                    } catch (error) {
                      console.error("Error fetching user data:", error);
                    }
                  }}
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
                  <button onClick={(e) => handleModalToggle(e, post)}>
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
            <p className="text-[#4A4A4A] mb-4 break-all">{post.description}</p>
            {post.category_id && (
              <span className="inline-block bg-[#DFFFD6] text-[#22C55E] text-sm font-semibold py-1 px-3 rounded-lg mb-4">
                {post.category_id}
              </span>
            )}
            {post.image_url && (
              <div
                className="bg-gray-300 flex items-center justify-center rounded-lg h-[250px] mb-4 relative overflow-hidden cursor-pointer"
                onClick={() => handleCommentModalToggle(post)}
              >
                <Image
                  src={post.image_url}
                  alt="Post Image"
                  width={444}
                  height={300}
                  className="object-cover h-[250px] w-[656px] rounded-lg relative z-0"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post.id, "DOWNVOTE");
                  }}
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
                <span className="text-black">{post.counter}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleVote(post.id, "UPVOTE");
                  }}
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
                isOpen={showCommentModal}
                onClose={closeCommentModal}
                comments={post.comments}
                post={selectedPost}
                updateComments={(newComments) =>
                  setPosts((prevPosts) =>
                    prevPosts.map((p) =>
                      p.id === post.id ? { ...p, comments: newComments } : p
                    )
                  )
                }
              />
            )}
            {showModal &&
              selectedPost?.id === post.id &&
              post.user?.id !== session?.user?.id &&
              createPortal(
                <ModalDots
                  isOpen={showModal}
                  onClose={() => setShowModal(false)}
                  position={modalPosition}
                  postId={selectedPost?.id}
                  reporterId={session?.user?.id}
                />,
                document.body
              )}
          </div>
        );
      })}
    </div>
  );
}

export default CommunityPostContainer;
