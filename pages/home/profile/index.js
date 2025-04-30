// pages/home/profile/index.js
import Link from "next/link";
import Navbar from "../../../components/ui/navbar";
import Image from "next/image";
import { useState, useEffect } from "react";
import Skeleton from "../../../components/ui/skeleton";
import axios from "axios";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import FollowerModal from "./modal-follower";
import FollowingModal from "./modal-following";
import EditProfileModal from "./modal-editprofile";
import NotificationSidebar from "../../notification";
import CommunitySidebar from "../../communities";
import UserPostContainer from "@/components/UserPostContainer";

export default function Profile() {
  const router = useRouter();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState("Posts");
  const [isFollowerModalOpen, setIsFollowerModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userPostCount, setUserPostCount] = useState(0);
  const [archiveModalMessage, setArchiveModalMessage] = useState(null);

  const isRouterReady = router.isReady;
  const userId = router.query.userId;
  const isCurrentUser = userId ? userId === session?.user?.id : true;

  useEffect(() => {
    if (!isRouterReady) return;
    fetchUserData();
    fetchUserPostCount();
  }, [isRouterReady, userId]);

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const url = `/api/user/profile${userId ? `?userId=${userId}` : ""}`;
      const response = await axios.get(url);
      setUserData(response.data);
    } catch (error) {
      console.error("Failed to fetch user data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPostCount = async () => {
    try {
      const query = userId ? `?userId=${userId}` : "";
      const response = await axios.get(`/api/user/profile${query}`);
      if (response.status === 200) {
        setUserPostCount(response.data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch post count:", error);
    }
  };

  const handleProfileUpdate = (updatedData) => {
    setUserData((prev) => ({ ...prev, ...updatedData }));
  };

  const handleImageUpdate = async (type, file) => {
    const formData = new FormData();
    formData.append("file", file);
    try {
      const endpoint =
        type === "profile"
          ? "/api/user/uploadProfileImage"
          : "/api/user/uploadHeaderImage";
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Image upload failed");
      }
      const data = await res.json();
      setUserData((prev) => ({
        ...prev,
        [type === "profile" ? "profileImg" : "headerImg"]: data.fileUrl,
      }));
      return data.fileUrl;
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    }
  };

  const closeModalAndFetchData = () => {
    setIsEditProfileModalOpen(false);
    fetchUserData();
    fetchUserPostCount();
  };

  const handleArchive = async (postId) => {
    if (!isCurrentUser) return;
    const isArchive = activeTab === "Posts";
    try {
      const res = await fetch("/api/post/archive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId,
          action: isArchive ? "archive" : "unarchive",
        }),
      });
      if (!res.ok) {
        const e = await res.json();
        console.error("Error archiving:", e.message);
        return;
      }
      setArchiveModalMessage(isArchive ? "Post Archived" : "Post Unarchived");
      if (!isArchive) setActiveTab("Posts");
      setTimeout(() => setArchiveModalMessage(null), 2000);
    } catch (error) {
      console.error("Archive/unarchive error:", error);
    }
  };

  if (!isRouterReady) return <div>Loading router...</div>;

  return (
    <div className="bg-[#F0FDF4] min-h-screen">
      <Navbar />
      <div className="px-16 py-10 mt-12 flex justify-center space-x-8">
        {/* Left sidebar */}
        <div
          className="mt-14 left-[17.7rem] bg-white p-6 rounded-[15px] shadow-lg fixed z-30 top-8"
          style={{
            width: "318px",
            height: "430px",
            boxShadow:
              "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
            border: "1px solid #E0E0E0",
          }}
        >
          <div className="flex flex-col items-center">
            {loading ? (
              <>
                <Skeleton
                  width="100%"
                  height="80px"
                  className="rounded-t-[15px] mb-[-2rem]"
                />
                <Skeleton
                  width="96px"
                  height="96px"
                  className="rounded-full border-4 mb-4"
                />
                <Skeleton width="150px" height="25px" className="mb-2" />
                <Skeleton width="100px" height="20px" />
              </>
            ) : (
              <>
                <div
                  className="w-full bg-cover bg-center rounded-t-[15px] mb-[-2rem]"
                  style={{
                    backgroundImage: `url(${
                      userData?.headerImg || "/images/headers.png"
                    })`,
                    height: "100px",
                    borderRadius: "8px",
                  }}
                ></div>
                <Image
                  src={userData?.profileImg || "/images/user.png"}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white mb-4"
                  onClick={() =>
                    document.getElementById("profileFileInput").click()
                  }
                />
                <input
                  id="profileFileInput"
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) =>
                    handleImageUpdate("profile", e.target.files[0])
                  }
                />
                <h2 className="text-[25px] font-bold text-black">
                  {userData?.name}
                </h2>
                <p className="text-[#787070] text-[15px]">
                  @{userData?.username}
                </p>
                <div className="flex justify-center space-x-5 w-full mt-5 mb-6">
                  <div
                    className="flex flex-col items-center"
                    style={{ minWidth: "80px" }}
                  >
                    <p className="font-bold text-[18px] text-black">
                      {userPostCount || 0}
                    </p>
                    <p className="text-[15px] text-[#787070]">
                      User’s Posts
                    </p>
                  </div>
                </div>
                {isCurrentUser && (
                  <button
                    onClick={() => setIsEditProfileModalOpen(true)}
                    className="border border-[#28B446] text-[#28B446] font-semibold rounded-[6px] mt-5 transition duration-300 hover:bg-[#28B446] hover:text-white"
                    style={{ width: "170px", height: "34px" }}
                  >
                    Edit Profile
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col space-y-4" style={{ width: "655px" }}>
          <div
            className="z-40 fixed flex items-center justify-between bg-white rounded-[15px] p-4 shadow-inner"
            style={{
              width: "655px",
              height: "69px",
              boxShadow:
                "0 4px 10px rgba(0, 0, 0, 0.15), inset 0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h2 className="text-[25px] font-bold text-black mr-4">
              {isCurrentUser ? "My Posts" : "Posts"}
            </h2>
            {isCurrentUser && (
              <div className="flex">
                <button
                  onClick={() => setActiveTab("Posts")}
                  className={`px-4 py-2 font-semibold rounded-l-[5px] transform transition-transform duration-100 ${
                    activeTab === "Posts"
                      ? "bg-[#E4FCDE] text-[#22C55E] scale-105"
                      : "bg-[#D9D9D9] text-black"
                  }`}
                >
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab("Archived")}
                  className={`px-4 py-2 font-semibold rounded-r-[5px] transform transition-transform	duration-100 ${
                    activeTab === "Archived"
                      ? "bg-[#E4FCDE] text-[#22C55E] scale-105"
                      : "bg-[#D9D9D9] text-black"
                  }`}
                >
                  Archived
                </button>
              </div>
            )}
          </div>
          <hr className="z-[20] fixed left-0 top-0 w-full flex-grow border-t-[10rem] border-[#F0FDF4]" />

          <div className="pt-[6rem]">
            <UserPostContainer
              userId={userId}
              activeTab={activeTab}
              handleArchive={handleArchive}
              isCurrentUser={isCurrentUser}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="right-[16rem] flex flex-col space-y-5 fixed z-40 top-21">
          <NotificationSidebar />
          <CommunitySidebar />
        </div>
      </div>

      <FollowerModal
        isOpen={isFollowerModalOpen}
        onClose={() => setIsFollowerModalOpen(false)}
        followers={userData?.followers || []}
      />
      <FollowingModal
        isOpen={isFollowingModalOpen}
        onClose={() => setIsFollowingModalOpen(false)}
        following={userData?.following || []}
      />
      <EditProfileModal
        isOpen={isEditProfileModalOpen}
        onClose={closeModalAndFetchData}
        onProfileUpdate={handleProfileUpdate}
        currentProfileData={userData}
      />
      {archiveModalMessage && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-4 rounded">
            <p className="text-green-600 font-bold">{archiveModalMessage}</p>
          </div>
        </div>
      )}
    </div>
  );
}
