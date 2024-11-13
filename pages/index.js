import Link from 'next/link';
import Navbar from '../components/ui/navbar';
import Image from 'next/image';
import PostContainer from './home/postcontainer';
import { useState, useEffect } from 'react';
import CreatePostModal from './modal-createpost';
import ModalFilterCategory from './modal-filtercategory';
import CreateCommunityModal from './modal-createcommunity';
import Skeleton from '../components/ui/skeleton';
import axios from 'axios';
import { motion } from 'framer-motion';

export default function Home() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);
  const [isCreateCommunityModalOpen, setCreateCommunityModalOpen] = useState(false);
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

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Handlers for opening and closing modals
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openFilterModal = () => setFilterModalOpen(true);
  const closeFilterModal = () => setFilterModalOpen(false);
  const openCreateCommunityModal = () => setCreateCommunityModalOpen(true);
  const closeCreateCommunityModal = () => setCreateCommunityModalOpen(false);

  return (
    <div className="bg-[#F0FDF4] min-h-screen">
      <Navbar />

      <div className="px-16 py-10 mt-12 flex justify-center space-x-8">
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
                    <p className="font-bold text-[18px] text-black">{userData?.posts || 0}</p>
                    <p className="text-[15px] text-[#787070]">Post</p>
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

        <div className="flex flex-col space-y-4" style={{ width: '655px' }}>
          <div
            className="flex bg-white p-4 rounded-[15px] shadow-lg cursor-pointer"
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

          <div className="flex items-center mt-5 mb-[43px] relative">
            <hr className="flex-grow border-t border-[#000000]" />
            <motion.button
              whileHover={{ scale: 1.05, backgroundColor: '#E0E7FF' }}
              whileTap={{ scale: 0.95 }}
              className="ml-3 flex items-center justify-center text-[#787070] text-[13px] font-medium rounded-[4px]"
              style={{
                width: '170px',
                height: '30px',
                border: '1px solid #787070',
                backgroundColor: '#F4F3F3',
                borderRadius: '4px',
              }}
              onClick={openFilterModal}
            >
              <Image src="/svg/filter.svg" alt="Filter Icon" width={16} height={16} className="mr-2" />
              Filter Category
              <Image src="/svg/downfilter.svg" alt="Down Arrow Icon" width={12} height={12} className="ml-2" />
            </motion.button>
          </div>

          {loading ? (
            <Skeleton width="100%" height="300px" className="rounded-lg" />
          ) : (
            <PostContainer />
          )}
        </div>

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
              <button className="text-[#22C55E] text-[15px]" onClick={openCreateCommunityModal}>
                See all
              </button>
            </div>
            <hr className="border-t border-black w-full mb-3 mt-2" style={{ height: '1px' }} />
            <div
              className="flex items-center mb-3 hover:bg-[#D9D9D9] rounded-md px-3 py-1 transition-colors duration-200 cursor-pointer"
              style={{ width: '100%' }}
              onClick={openCreateCommunityModal}
            >
              <Image src="/svg/add.svg" alt="Add Community" width={14} height={14} className="mr-2" style={{ marginLeft: '-5px' }} />
              <span className="text-black text-[17px] font-light">
                Create a community
              </span>
            </div>
            <ul className="space-y-2 text-black">
              <li className="flex items-center justify-between hover:bg-[#D9D9D9] rounded-md px-3 py-1 transition-colors duration-200" style={{ width: '100%' }}>
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
              <li className="flex items-center justify-between hover:bg-[#D9D9D9] rounded-md px-3 py-1 transition-colors duration-200" style={{ width: '100%' }}>
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

      <CreatePostModal isOpen={isModalOpen} onClose={closeModal} />
      <ModalFilterCategory isOpen={isFilterModalOpen} onClose={closeFilterModal} />
      <CreateCommunityModal isOpen={isCreateCommunityModalOpen} onClose={closeCreateCommunityModal} />
    </div>
  );
}
