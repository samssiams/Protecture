import Image from "next/image";
import { useEffect, useState } from "react";
import ModalDots from "../../pages/home/profile/modal-dots";
import CommentModal from "../../pages/home/modal-comment";
import { useRouter } from "next/router";

function PostContainer({ selectedCategory }) {
  const [posts, setPosts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [modalPosition, setModalPosition] = useState({ left: 0, top: 0 });
  const [selectedPost, setSelectedPost] = useState(null);
  const [votedPosts, setVotedPosts] = useState({}); // Track upvote/downvote state
  const router = useRouter();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Determine the current route
        const currentPath = router.pathname;

        // Build the query string based on the current path
        const query = currentPath === "/home/profile" ? "?currentPath=/home/profile" : "";

        // Fetch posts from the API
        const response = await fetch(`/api/post/getposts${query}`);
        if (response.ok) {
          const data = await response.json();
          setPosts(data);

          // Initialize vote state
          const initialVotes = data.reduce((acc, post) => {
            if (post.userVote) {
              acc[post.id] = post.userVote;
            }
            return acc;
          }, {});
          setVotedPosts(initialVotes);
        } else {
          console.error("Error fetching posts");
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, [router.pathname]);

  const handleModalToggle = (event, post) => {
    const dotsButton = event.currentTarget;
    const rect = dotsButton.getBoundingClientRect();

    const position = {
      left: rect.left + window.scrollX, // Adjust for horizontal scrolling
      top: rect.bottom + window.scrollY + 5, // Adjust to position below the dots
    };

    setSelectedPost(post);
    setModalPosition(position); // Set modal position dynamically
    setShowModal((prevShowModal) => !prevShowModal);
  };

  const handleCommentModalToggle = (post) => {
    setSelectedPost(post);
    setShowCommentModal(true); // Open the CommentModal
  };

  const closeCommentModal = () => {
    setShowCommentModal(false); // Close the CommentModal
  };

  const handleVote = async (postId, action) => {
    try {
      const requestBody = { postId, action };

      const response = await fetch("/api/post/vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const updatedPost = await response.json();

        // Update vote state
        setVotedPosts((prevVotes) => ({
          ...prevVotes,
          [postId]: prevVotes[postId] === action ? null : action,
        }));

        // Update posts
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

  const handleArchive = async (postId) => {
    try {
      const response = await fetch("/api/post/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      if (response.ok) {
        alert("Post archived successfully!");

        // Remove the archived post from the state
        setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      } else {
        const errorData = await response.json();
        console.error("Error archiving post:", errorData.message);
      }
    } catch (error) {
      console.error("Error archiving post:", error);
    }
  };

  // Filter posts by selected category, if a category is selected
  const filteredPosts = selectedCategory
    ? posts.filter((post) => post.category_id === selectedCategory)
    : posts;

  if (!filteredPosts.length) {
    return <div>Fetching all posts...</div>;
  }

  return (
    <div>
      {filteredPosts.map((post) => {
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
            {/* Header Section */}
            <div className="flex items-center mb-4">
              <Image
                src={post.user?.profile?.profile_img || "/images/default-profile.png"}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-4">
                <h3 className="font-bold text-black">
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
                {router.pathname === "/home/profile" ? (
                  <button
                    className="bg-green-500 text-white px-3 py-1 rounded"
                    onClick={() => handleArchive(post.id)}
                  >
                    Archive
                  </button>
                ) : (
                  <button onClick={(e) => handleModalToggle(e, post)}>
                    <Image src="/svg/dots.svg" alt="Options" width={4} height={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Post Description */}
            <p className="text-[#4A4A4A] mb-4">{post.description}</p>
            <span className="inline-block bg-[#DFFFD6] text-[#22C55E] text-sm font-semibold py-1 px-3 rounded-lg mb-4">
              {post.category_id}
            </span>

            {/* Post Image */}
            <div
              className="bg-gray-300 flex items-center justify-center rounded-lg h-[250px] mb-4 relative overflow-hidden cursor-pointer"
              onClick={() => handleCommentModalToggle(post)}
            >
              <Image
                src={post.image_url}
                alt="Post Image"
                width={444}
                height={300}
                className="object-cover h-[250px] w-[656px] rounded-lg"
              />
            </div>

            {/* Reaction Section */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {/* Downvote Button */}
                <button
                  onClick={() => handleVote(post.id, "DOWNVOTE")}
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

                {/* Counter */}
                <span className="text-black">{post.counter}</span>

                {/* Upvote Button */}
                <button
                  onClick={() => handleVote(post.id, "UPVOTE")}
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

              {/* Comments Section */}
              <div className="flex items-center space-x-2">
                <button onClick={() => handleCommentModalToggle(post)}>
                  <Image src="/svg/comments.svg" alt="Comments" width={21} height={21} />
                </button>
                <span className="text-black">{post.comments.length}</span>
              </div>
            </div>

            {/* Comment Modal */}
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

            {/* Dots Modal */}
            {showModal && selectedPost?.id === post.id && (
              <ModalDots
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                position={modalPosition} // Pass the dynamically calculated position
                post={post}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default PostContainer;
