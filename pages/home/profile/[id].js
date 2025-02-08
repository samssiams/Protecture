import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Navbar from "../../../components/ui/navbar";
import PostContainer from "../postcontainer";
import axios from "axios";

const UserProfile = () => {
  const router = useRouter();
  const { id } = router.query;

  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserData();
      fetchUserPosts();
    }
  }, [id]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`/api/user/profile/${id}`);
      setUserData(response.data);
      setIsFollowing(response.data.isFollowing);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const fetchUserPosts = async () => {
    try {
      const response = await axios.get(`/api/post/user/${id}`);
      setPosts(response.data);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const response = await axios.post(`/api/user/follow`, { userId: id });
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Error following/unfollowing user:", error);
    }
  };

  return (
    <div className="bg-[#F0FDF4] min-h-screen">
      <Navbar />
      <div className="flex justify-center mt-12">
        <div className="w-[65%] bg-white p-6 rounded shadow">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">{userData?.name}</h2>
                <button
                  className={`px-4 py-2 rounded ${
                    isFollowing ? "bg-red-500 text-white" : "bg-green-500 text-white"
                  }`}
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              </div>
              <p className="text-gray-600">@{userData?.username}</p>
              <div className="mt-6">
                <h3 className="text-lg font-semibold">Posts</h3>
                <PostContainer posts={posts} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;