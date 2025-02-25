import Link from 'next/link';
import Navbar from '@/components/ui/navbar';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import CreatePostModal from '../modal-createpost';
import CreateCommunityModal from '../modal-createcommunity';
import Skeleton from '@/components/ui/skeleton';
import axios from 'axios';
import Chatbot from '@/components/ui/chatbot';
import { useRouter } from 'next/router';
import CommunityPostContainer from './communitypostcontainer';
import ModalMembers from '../modal-members';

export default function CommunityHome() {
  const [isPostModalOpen, setPostModalOpen] = useState(false);
  const [isCreateCommunityModalOpen, setCreateCommunityModalOpen] = useState(false);
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [communityData, setCommunityData] = useState(null);
  const [userPostCount, setUserPostCount] = useState(0);
  const router = useRouter();
  const { id } = router.query;
  const [isMembersModalOpen, setMembersModalOpen] = useState(false);

  // Fetch current user's profile
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

  // Fetch community details (for right sidebar)
  const fetchCommunityDetails = async () => {
    if (!id) return;
    try {
      const response = await axios.get('/api/community/get-community-details', {
        params: { communityId: id },
      });
      if (response.status === 200) {
        setCommunityData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch community details:', error);
    }
  };

  // Fetch user post count (used in left sidebar)
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
    fetchCommunityDetails();
    fetchUserPostCount();
  }, [id]);

  // Function to actually leave the community:
  const handleConfirmLeave = async () => {
    setIsLeaving(true);
    try {
      await axios.post(
        '/api/community/leave',
        { communityId: Number(id) },
        { headers: { 'Content-Type': 'application/json' } }
      );
      // Navigate back to the index page after leaving.
      router.push('/');
    } catch (error) {
      console.error("Error leaving community:", error.response?.data || error.message);
    } finally {
      setIsLeaving(false);
      setLeaveModalOpen(false);
    }
  };

  const openPostModal = () => setPostModalOpen(true);
  const closePostModal = () => setPostModalOpen(false);
  const openCreateCommunityModal = () => setCreateCommunityModalOpen(true);
  const closeCreateCommunityModal = () => setCreateCommunityModalOpen(false);

  const refreshCommunityHome = () => {
    window.location.reload();
  };

  return (
    <div className="bg-[#F0FDF4] min-h-screen">
      <Navbar>
        <button onClick={refreshCommunityHome} className="text-black font-bold text-lg">
          Home
        </button>
      </Navbar>

      <div className="px-16 py-10 mt-12 flex justify-center space-x-8">
        {/* Left Sidebar */}
        <div
          className="mt-14 left-[17.7rem] bg-white p-6 rounded-[15px] shadow-lg fixed z-40 top-8"
          style={{
            width: '318px',
            height: 'auto',
            boxShadow: '0 4px 8px rgba(0,0,0,0.1), inset 0 2px 6px rgba(0,0,0,0.2)',
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
                    <p className="text-[15px] text-[#787070]">Users Posts</p>
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

                {/* "Leave Community" button */}
                <button
                  onClick={() => setLeaveModalOpen(true)}
                  className="border border-red-500 text-red-500 font-semibold rounded-[6px] mt-4 transition duration-300 hover:bg-red-500 hover:text-white"
                  style={{
                    width: '170px',
                    height: '34px',
                  }}
                >
                  Leave Community
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col space-y-4" style={{ width: '655px' }}>
          <div
            className="fixed w-[41rem] z-40 flex bg-white p-4 rounded-[15px] shadow-lg cursor-pointer"
            onClick={openPostModal}
            style={{
              height: '92px',
              boxShadow:
                '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 6px rgba(0, 0, 0, 0.3)',
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

          {/* Community Posts */}
          <div className="pt-[11rem] flex items-center mt-5 mb-[43px] relative">
            <CommunityPostContainer communityId={id} />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="right-[16rem] flex flex-col space-y-5 fixed z-40 top-8">
          <div
            className="mt-14 bg-white p-4 rounded-[15px] shadow-lg custom-scrollbar"
            style={{
              width: '316px',
              maxHeight: 'auto',
              overflowY: 'auto',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
              border: '1px solid #E0E0E0',
            }}
          >
            {/* Header with community name and member count */}
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-[18px] text-black">
                {communityData ? `p/${communityData.name}` : <Skeleton width="150px" height="25px" />}
              </h2>
              {communityData && communityData.members ? (
                <span
                  onClick={() => setMembersModalOpen(true)}
                  className="cursor-pointer text-[16px] text-gray-600 font-bold"
                >
                  Members: {communityData.members.filter(m => m.status === "joined").length}
                </span>
              ) : (
                <Skeleton width="80px" height="20px" />
              )}
            </div>
            <hr className="border-t border-black w-full mb-3" />
            <ul className="space-y-2">
              {communityData ? (
                <p className="text-black/80 text-center">{communityData.description}</p>
              ) : (
                <Skeleton width="100%" height="20px" />
              )}
            </ul>
          </div>
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
        <Chatbot />
      </div>

      {/* Members Modal */}
      {communityData && communityData.members && (
        <ModalMembers
          isOpen={isMembersModalOpen}
          onClose={() => setMembersModalOpen(false)}
          members={communityData.members.filter((m) => m.status === 'joined')}
        />
      )}

      {/* Leave Community Confirmation Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-lg text-red-500 font-semibold mb-4">Confirm Leave</h2>
            <p className="mb-8 text-black font-semibold">
              Are you sure you want to leave this community?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setLeaveModalOpen(false)}
                className="px-4 py-2 bg-gray-600 font-bold rounded hover:bg-gray-500"
                disabled={isLeaving}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLeave}
                className="px-4 py-2 bg-red-500 text-white font-bold rounded hover:bg-red-600"
                disabled={isLeaving}
              >
                {isLeaving ? "Leaving..." : "Leave Community"}
              </button>
            </div>
          </div>
        </div>
      )}

      <CreatePostModal isOpen={isPostModalOpen} onClose={closePostModal} userData={userData} communityId={id} />
      <CreateCommunityModal isOpen={isCreateCommunityModalOpen} onClose={closeCreateCommunityModal} />
    </div>
  );
}
