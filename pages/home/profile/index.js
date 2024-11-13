import Link from 'next/link';
import Navbar from '../../../components/ui/navbar';
import Image from 'next/image';
import PostContainer from '../postcontainer';
import { useState, useEffect } from 'react';
import FollowerModal from './modal-follower';
import FollowingModal from './modal-following';
import EditProfileModal from './modal-editprofile';
import Skeleton from '../../../components/ui/skeleton';
import axios from 'axios';

export default function Profile() {
  const [activeTab, setActiveTab] = useState('Posts');
  const [isFollowerModalOpen, setIsFollowerModalOpen] = useState(false);
  const [isFollowingModalOpen, setIsFollowingModalOpen] = useState(false);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Function to fetch user data from the API
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

  // Initial fetch of user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const handleProfileUpdate = (updatedData) => {
    // Directly update userData in state to reflect changes immediately
    setUserData(prevData => ({
      ...prevData,
      ...updatedData,
    }));
  };

  const handleImageUpdate = async (type, file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
      const endpoint = type === 'profile' ? '/api/user/uploadProfileImage' : '/api/user/uploadHeaderImage';

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Image upload failed');
      }

      const data = await response.json();
      if (type === 'profile') {
        setUserData(prevData => ({ ...prevData, profileImg: data.fileUrl }));
      } else {
        setUserData(prevData => ({ ...prevData, headerImg: data.fileUrl }));
      }

      return data.fileUrl; // Return the uploaded image URL
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  const closeModalAndFetchData = () => {
    setIsEditProfileModalOpen(false); // Close modal
    fetchUserData(); // Re-fetch user data to ensure the latest updates
  };

  return (
    <div className="bg-[#F0FDF4] min-h-screen">
      <Navbar />

      <div className="px-16 py-10 mt-12 flex justify-center space-x-8">
        {/* Profile Sidebar */}
        <div
          className="bg-white p-6 rounded-[15px] shadow-lg sticky top-8"
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
                  width={100}
                  height={100}
                  className="rounded-full border-4 border-white mb-4"
                  onClick={() => {
                    document.getElementById('profileFileInput').click();
                  }}
                />
                <input
                  type="file"
                  id="profileFileInput"
                  style={{ display: 'none' }}
                  accept="image/jpeg, image/png"
                  onChange={(e) => handleImageUpdate('profile', e.target.files[0])}
                />

                <h2 className="text-[25px] font-bold text-black">{userData?.name}</h2>
                <p className="text-[#787070] text-[15px]">@{userData?.username}</p>

                <div className="flex justify-center space-x-5 w-full mt-5 mb-6">
                  <div className="flex flex-col items-center" style={{ minWidth: '80px' }}>
                    <p className="font-bold text-[18px] text-black">{userData?.posts || 0}</p>
                    <p className="text-[15px] text-[#787070]">Posts</p>
                  </div>
                  <div
                    className="flex flex-col items-center cursor-pointer"
                    style={{ minWidth: '80px' }}
                    onClick={() => setIsFollowerModalOpen(true)}
                  >
                    <p className="font-bold text-[18px] text-black">{userData?.followers || 0}</p>
                    <p className="text-[15px] text-[#787070]">Followers</p>
                  </div>
                  <div
                    className="flex flex-col items-center cursor-pointer"
                    style={{ minWidth: '80px' }}
                    onClick={() => setIsFollowingModalOpen(true)}
                  >
                    <p className="font-bold text-[18px] text-black">{userData?.following || 0}</p>
                    <p className="text-[15px] text-[#787070]">Following</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsEditProfileModalOpen(true)}
                  className="border border-[#28B446] text-[#28B446] font-semibold rounded-[6px] mt-5 transition duration-300 hover:bg-[#28B446] hover:text-white"
                  style={{
                    width: '170px',
                    height: '34px',
                  }}
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex flex-col space-y-4" style={{ width: '655px' }}>
          <div
            className="flex items-center justify-between bg-white rounded-[15px] p-4 shadow-inner"
            style={{
              width: '655px',
              height: '69px',
              boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15), inset 0 2px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h2 className="text-[25px] font-bold text-black mr-4">My Posts</h2>
            <div className="flex">
              <button
                onClick={() => setActiveTab('Posts')}
                className={`px-4 py-2 font-semibold rounded-l-[5px] transform transition-transform duration-100 ${
                  activeTab === 'Posts' ? 'bg-[#E4FCDE] text-[#22C55E] scale-105' : 'bg-[#D9D9D9] text-black'
                }`}
              >
                Posts
              </button>
              <button
                onClick={() => setActiveTab('Archived')}
                className={`px-4 py-2 font-semibold rounded-r-[5px] transform transition-transform duration-100 ${
                  activeTab === 'Archived' ? 'bg-[#E4FCDE] text-[#22C55E] scale-105' : 'bg-[#D9D9D9] text-black'
                }`}
              >
                Archived
              </button>
            </div>
          </div>

          <PostContainer />
        </div>

        {/* Right Sidebar */}
        <div className="flex flex-col space-y-5 sticky top-8">
          <div
            className="bg-white p-4 rounded-[15px] shadow-lg"
            style={{
              width: '316px',
              height: '200px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="flex justify-between items-center mb-2">
              <h2 className="font-semibold text-[18px] text-black">Activity</h2>
              <button className="text-[#28B446] text-[15px]">See all</button>
            </div>
            <hr className="border-t border-black w-full mb-3" style={{ height: '1px' }} />
            <ul className="space-y-2 text-black">
              <li className="flex items-center">
                <Image src="/images/user.png" alt="Notification" width={32} height={32} className="rounded-full mr-2" />
                <span className="text-[16px]">
                  <strong>Sam</strong> started following you.
                </span>
              </li>
              <li className="flex items-center">
                <Image src="/images/user.png" alt="Notification" width={32} height={32} className="rounded-full mr-2" />
                <span className="text-[16px]">
                  <strong>Alex</strong> liked your post.
                </span>
              </li>
            </ul>
          </div>

          <div
            className="bg-white p-4 rounded-[15px] shadow-lg"
            style={{
              width: '316px',
              height: '288px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div className="flex justify-between items-center">
              <h2 className="font-semibold text-[18px] text-black">Communities</h2>
              <button className="text-[#22C55E] text-[15px]">See all</button>
            </div>
            <hr className="border-t border-black w-full mb-3 mt-2" style={{ height: '1px' }} />
            <ul className="space-y-2 text-black">
              <li className="flex items-center justify-between hover:bg-[#D9D9D9] rounded-md px-2 py-1 transition-colors duration-200">
                <span className="text-[16px] font-semibold">p/Cottage</span>
                <button
                  className="bg-[#22C55E] text-white font-semibold text-[13px] px-3 py-1 rounded-[6px]"
                  style={{
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  Enter
                </button>
              </li>
              <li className="flex items-center justify-between hover:bg-[#D9D9D9] rounded-md px-2 py-1 transition-colors duration-200">
                <span className="text-[16px] font-semibold">p/Bungalow</span>
                <button
                  className="border border-[#22C55E] text-[#22C55E] font-semibold text-[13px] px-3 py-1 rounded-[6px] hover:bg-[#22C55E] hover:text-white transition-colors duration-200"
                >
                  Join
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Modals */}
      <FollowerModal isOpen={isFollowerModalOpen} onClose={() => setIsFollowerModalOpen(false)} followers={userData?.followers || []} />
      <FollowingModal isOpen={isFollowingModalOpen} onClose={() => setIsFollowingModalOpen(false)} following={userData?.following || []} />
      <EditProfileModal 
        isOpen={isEditProfileModalOpen} 
        onClose={closeModalAndFetchData} // Automatically refresh data after closing
        onProfileUpdate={handleProfileUpdate} 
        currentProfileData={userData} 
      />
    </div>
  );
}
