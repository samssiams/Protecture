import Link from 'next/link';
import Navbar from '@/components/ui/navbar';
import Image from 'next/image';
import PostContainer from '../home/postcontainer';
import { useState, useEffect } from 'react';
import CreatePostModal from '../modal-createpost';
import CreateCommunityModal from '../modal-createcommunity';
import CommentModal from '../home/modal-comment';
import Skeleton from '@/components/ui/skeleton';
import axios from 'axios';
import Chatbot from '@/components/ui/chatbot';
import { useRouter } from 'next/router';
import NotificationSidebar from '../notification'; // Import the Notification Sidebar

export default function Home() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isCreateCommunityModalOpen, setCreateCommunityModalOpen] = useState(false);
  const [isCommentModalOpen, setCommentModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [userPostCount, setUserPostCount] = useState(0);
  const [commentSubmitted, setCommentSubmitted] = useState(false);
  const router = useRouter();

  const fetchUserData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/user/profile');
      setUserData(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPostCount = async () => {
    try {
      const response = await axios.get('/api/post/getposts?countOnly=true');
      if (response.status === 200) {
        setUserPostCount(response.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch user post count:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
    fetchUserPostCount();
  }, []);

  useEffect(() => {
    const { postId } = router.query;

    if (postId) {
      const fetchPostDetails = async () => {
        try {
          const response = await axios.get(`/api/post/getpost?postId=${postId}`);
          if (response.status === 200) {
            setCurrentPost(response.data);
            setCommentModalOpen(true);
          }
        } catch (error) {
          console.error("Failed to fetch post details:", error);
        }
      };

      fetchPostDetails();
    }
  }, [router.query]);

  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openCreateCommunityModal = () => setCreateCommunityModalOpen(true);
  const closeCreateCommunityModal = () => setCreateCommunityModalOpen(false);

  const closeCommentModal = () => {
    setCommentModalOpen(false);
    setCurrentPost(null);

    if (commentSubmitted) {
      fetchUserPostCount();
      window.location.reload();
      setCommentSubmitted(false);
    }

    router.push('/', undefined, { shallow: true });
  };

  const refreshHomePage = () => {
    window.location.reload();
  };

  return (
    <div className="bg-[#F0FDF4] min-h-screen">
      <Navbar>
        <button onClick={refreshHomePage} className="text-black font-bold text-lg">Home</button>
      </Navbar>

      <div className="px-16 py-10 mt-12 flex justify-center space-x-8">
        {/* Left Sidebar */}
        <div
          className="mt-14 left-[17.7rem] bg-white p-6 rounded-[15px] shadow-lg fixed z-40 top-8"
          style={{
            width: '318px',
            height: '430px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
            border: '1px solid #E0E0E0',
          }}
        >
          <div className="flex flex-col items-center">
            {loading ? (
              <>
                <Skeleton width="100%" height="80px" className="rounded-t-[15px] mb-[-2rem]" />
                <Skeleton width="96px" height="96px" className="rounded-full border-4 mb-4" />
                <Skeleton width="150px" height="25px" className="mb-2" />
                <Skeleton width="100px" height="20px" />
              </>
            ) : (
              <>
                <div
                  className="w-full bg-cover bg-center rounded-t-[15px] mb-[-2rem]"
                  style={{
                    backgroundImage: `url(${userData?.headerImg || '/images/headers.png'})`,
                    height: '100px',
                    borderRadius: '8px',
                  }}
                ></div>

                <Image
                  src={userData?.profileImg || '/images/user.png'}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="rounded-full border-4 border-white mb-4"
                />

                {userData ? (
                  <>
                    <h2 className="text-[25px] font-bold text-black">{userData.name}</h2>
                    <p className="text-[#787070] text-[15px]">@{userData.username}</p>
                  </>
                ) : (
                  <>
                    <Skeleton width="150px" height="25px" className="mb-2" />
                    <Skeleton width="100px" height="20px" />
                  </>
                )}

                <div className="flex justify-center space-x-5 w-full mt-5 mb-6">
                  <div className="flex flex-col items-center" style={{ minWidth: '80px' }}>
                    <p className="font-bold text-[18px] text-black">{userPostCount}</p>
                    <p className="text-[15px] text-[#787070]">Posts</p>
                  </div>
                  <div className="flex flex-col items-center" style={{ minWidth: '80px' }}>
                    <p className="font-bold text-[18px] text-black">{userData?.followers || 0}</p>
                    <p className="text-[15px] text-[#787070]">Followers</p>
                  </div>
                  <div className="flex flex-col items-center" style={{ minWidth: '80px' }}>
                    <p className="font-bold text-[18px] text-black">{userData?.following || 0}</p>
                    <p className="text-[15px] text-[#787070]">Following</p>
                  </div>
                </div>

                <Link href="/home/profile">
                  <button
                    className="border border-[#28B446] text-[#28B446] font-semibold rounded-[6px] mt-5 transition duration-300 hover:bg-[#28B446] hover:text-white"
                    style={{
                      width: '170px',
                      height: '34px',
                    }}
                  >
                    My Profile
                  </button>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col space-y-4" style={{ width: '655px' }}>
          <div
            className="fixed w-[41rem] z-40 flex bg-white p-4 rounded-[15px] shadow-lg cursor-pointer"
            onClick={openModal}
            style={{
              height: '92px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 6px rgba(0, 0, 0, 0.3)',
              borderRadius: '15px',
            }}
          >
            <div className="w-full flex items-center space-x-3">
              <Image
                src={userData?.profileImg || '/images/user.png'}
                alt="User"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div
                className="flex-grow p-2 rounded-full text-gray-700 text-[13px]"
                style={{
                  backgroundColor: '#F0F0F0',
                  borderRadius: '15px',
                  padding: '10px 15px',
                  border: '1px solid #787070',
                }}
              >
                Share your work
              </div>
            </div>
          </div>
          
          <hr className="fixed left-0 top-0 w-full z-10 flex-grow border-t-[15.5rem] border-[#F0FDF4]" />
          <hr className="fixed top-[220px] z-40 w-[41rem] flex-grow border-[.5] border-[#000000]" />
          
          {/* Removed Filter Category */}
          <div className="pt-[11rem] flex items-center mt-5 mb-[43px] relative">
            {loading ? (
              <div className="text-center mt-60 text-black font-bold text-lg">Loading posts...</div>
            ) : (
              <PostContainer selectedCategory={null} />
            )}
          </div>
        </div>

        <NotificationSidebar />
        <Chatbot />
      </div>

      <CreatePostModal open={isModalOpen} closeModal={closeModal} />
      <CreateCommunityModal open={isCreateCommunityModalOpen} closeModal={closeCreateCommunityModal} />
      <CommentModal open={isCommentModalOpen} closeModal={closeCommentModal} currentPost={currentPost} />
    </div>
  );
}