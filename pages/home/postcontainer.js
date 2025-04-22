import Image from "next/image";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import ModalDots from "../../pages/home/profile/modal-dots";
import CommentModal from "../../pages/home/modal-comment";
import Skeleton from "@/components/ui/skeleton";

const truncateDescription = (text, wordLimit = 30) => {
  const words = text.trim().split(/\s+/);
  if (words.length > wordLimit) {
    return { text: words.slice(0, wordLimit).join(" "), isTruncated: true };
  }
  const trimmed = text.trim();
  return { text: /[.!?]$/.test(trimmed) ? trimmed : trimmed + ".", isTruncated: false };
};

const PostSkeleton = () => (
  <div className="bg-white rounded-[15px] shadow-lg p-5 mb-4 animate-pulse" style={{
    width: "656px",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1), inset 0 2px 6px rgba(0,0,0,0.2)"
  }}>
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

export default function PostContainer({
  selectedCategory,
  posts: initialPosts,
  activeTab,
  handleArchive,
}) {
  const [posts, setPosts] = useState(initialPosts || []);
  const [votedPosts, setVotedPosts] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [showComment, setShowComment] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoading, setIsLoading] = useState(!initialPosts);
  const [expanded, setExpanded] = useState({});
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!initialPosts) {
      (async () => {
        const path = router.pathname === "/home/profile"
          ? "/api/post/getposts?currentPath=/home/profile"
          : "/api/post/getposts";
        const res = await fetch(path);
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
          setVotedPosts(data.reduce((a, p) => {
            if (p.userVote) a[p.id] = p.userVote;
            return a;
          }, {}));
        }
        setIsLoading(false);
      })();
    } else setIsLoading(false);
  }, [initialPosts, router.pathname]);

  useEffect(() => { if (initialPosts) setPosts(initialPosts); }, [initialPosts]);

  useEffect(() => {
    const h = e => e.target.tagName === "IMG" && e.preventDefault();
    document.addEventListener("contextmenu", h);
    return () => document.removeEventListener("contextmenu", h);
  }, []);

  useEffect(() => {
    const iv = setInterval(async () => {
      const path = router.pathname === "/home/profile"
        ? "/api/post/getposts?currentPath=/home/profile"
        : "/api/post/getposts";
      const res = await fetch(path);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
        setVotedPosts(data.reduce((a, p) => {
          if (p.userVote) a[p.id] = p.userVote;
          return a;
        }, {}));
      }
    }, 10000);
    return () => clearInterval(iv);
  }, [router.pathname]);

  const toggleExpand = id => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const vote = async (postId, action) => {
    const res = await fetch("/api/post/vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, action }),
    });
    if (res.ok) {
      const updated = await res.json();
      setVotedPosts(p => ({
        ...p,
        [postId]: p[postId] === action ? null : action,
      }));
      setPosts(p => p.map(x => x.id === updated.id ? updated : x));
    }
  };

  const filtered = selectedCategory
    ? posts.filter(p => p.category_id === selectedCategory)
    : posts;

  if (isLoading) {
    return <div>{[...Array(5)].map((_, i) => <PostSkeleton key={i} />)}</div>;
  }
  if (!filtered.length) {
    return <div className="text-center text-black font-bold text-lg">No Post Available</div>;
  }

  return (
    <div>
      {filtered.map(post => {
        const voteState = votedPosts[post.id];
        const { text, isTruncated } = truncateDescription(post.description);
        const full = post.description.trim().replace(/([.!?])?$/, "$1.");
        const hasImage = !!post.image_url;
        const isExp = expanded[post.id];
        return (
          <div key={post.id} className="bg-white rounded-[15px] shadow-lg p-5 mb-4"
            style={{ width: "656px", boxShadow: "0 4px 8px rgba(0,0,0,0.1), inset 0 2px 6px rgba(0,0,0,0.2)" }}>
            <div className="flex items-center mb-4">
              <Image
                src={post.user?.profile?.profile_img || "/images/default-profile.png"}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div className="ml-4">
                <h3
                  className="font-bold text-black cursor-pointer"
                  onClick={() => router.push(`/home/profile?userId=${post.user?.id}`)}
                >
                  {post.user?.profile?.name || post.user?.username}
                </h3>
                <span className="text-black text-xs">
                  {new Date(post.created_at).toLocaleTimeString([], {
                    hour: "2-digit", minute: "2-digit", hour12: true
                  })}
                </span>
              </div>
              <div className="ml-auto">
                {post.user?.id !== session?.user?.id && (
                  <button onClick={e => {
                    e.stopPropagation();
                    setSelectedPost(post);
                    setShowModal(true);
                  }}>
                    <Image src="/svg/dots.svg" alt="Options" width={4} height={16} />
                  </button>
                )}
                {post.user?.id === session?.user?.id &&
                  router.pathname === "/home/profile" && (
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded"
                      onClick={() => handleArchive(post.id)}
                    >
                      {activeTab === "Archived" ? "Unarchive" : "Archive"}
                    </button>
                  )}
              </div>
            </div>

            <p
              onClick={() => isExp && toggleExpand(post.id)}
              className={`text-[#4A4A4A] mb-4 break-all ${isExp ? "cursor-pointer" : ""}`}
            >
              {isExp
                ? full
                : isTruncated
                ? hasImage
                  ? <>
                      {text}...
                      <span
                        className="font-bold text-[#4A4A4A] cursor-pointer hover:underline ml-1"
                        onClick={e => {
                          e.stopPropagation();
                          toggleExpand(post.id);
                        }}
                      >
                        See more
                      </span>
                    </>
                  : <>
                      {text}...
                      <span
                        className="font-bold text-[#4A4A4A] cursor-pointer hover:underline ml-1"
                        onClick={() => {
                          setSelectedPost(post);
                          setShowComment(true);
                        }}
                      >
                        See more
                      </span>
                    </>
                : text}
            </p>

            {post.category_id && (
              <span className="inline-block bg-[#DFFFD6] text-[#22C55E] text-sm font-semibold py-1 px-3 rounded-lg mb-4">
                {post.category_id}
              </span>
            )}
            {hasImage && (
              <div
                className="bg-gray-300 flex items-center justify-center rounded-lg h-[250px] mb-4 relative overflow-hidden cursor-pointer"
                onClick={() => {
                  setSelectedPost(post);
                  setShowComment(true);
                }}
              >
                <Image
                  src={post.image_url}
                  alt="Post Image"
                  width={444}
                  height={300}
                  className="object-cover h-[250px] w-[656px] rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={e => { e.stopPropagation(); vote(post.id, "DOWNVOTE"); }}
                  className="rounded-full p-2 transition-all duration-200 hover:bg-[#f9c2c2]"
                >
                  <Image
                    src="/svg/downvote.svg"
                    alt="Downvote"
                    width={21}
                    height={21}
                    style={{
                      filter: voteState === "DOWNVOTE"
                        ? "invert(28%) sepia(73%) saturate(2574%) hue-rotate(335deg) brightness(88%) contrast(89%)"
                        : "none",
                      transition: "filter 0.2s ease-in-out",
                    }}
                  />
                </button>
                <span className="text-black">{post.counter}</span>
                <button
                  onClick={e => { e.stopPropagation(); vote(post.id, "UPVOTE"); }}
                  className="rounded-full p-2 transition-all duration-200 hover:bg-[#DCFCE7]"
                >
                  <Image
                    src="/svg/upvote.svg"
                    alt="Upvote"
                    width={21}
                    height={21}
                    style={{
                      filter: voteState === "UPVOTE"
                        ? "invert(53%) sepia(81%) saturate(575%) hue-rotate(107deg) brightness(91%) contrast(92%)"
                        : "none",
                      transition: "filter 0.2s ease-in-out",
                    }}
                  />
                </button>
              </div>
              <div className="flex items-center space-x-2">
                <button onClick={() => {
                  setSelectedPost(post);
                  setShowComment(true);
                }}>
                  <Image src="/svg/comments.svg" alt="Comments" width={21} height={21} />
                </button>
                <span className="text-black">{post.comments.length}</span>
              </div>
            </div>

            {showComment && selectedPost?.id === post.id && (
              <CommentModal
                isOpen={showComment}
                onClose={() => setShowComment(false)}
                comments={post.comments}
                post={selectedPost}
                updateComments={newComments =>
                  setPosts(prev => prev.map(p =>
                    p.id === post.id ? { ...p, comments: newComments } : p
                  ))
                }
              />
            )}
            {showModal && selectedPost?.id === post.id && (
              <div onClick={e => e.stopPropagation()}>
                <ModalDots
                  isOpen={showModal}
                  onClose={() => setShowModal(false)}
                  position={{ left: 0, top: 0 }}
                  postId={selectedPost.id}
                  reporterId={session?.user?.id}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
