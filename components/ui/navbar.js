// Navbar.js
import Link from "next/link";
import routes from "../../routes";
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    router.push(routes.auth.login);
  };

  const isActive = (path) => router.pathname === path;

  const handleConfirmLogout = () => {
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  return (
    <div className="fixed top-0 left-0 w-full bg-white shadow-md py-1 px-8 flex justify-between items-center z-50">
      {/* Logo and Search */}
      <div className="flex items-center space-x-6">
        <h1 className="text-xl font-bold text-green-600">Protecture</h1>
        <div 
          className="flex items-center border rounded-full px-4 py-2" 
          style={{ borderColor: '#787070', borderWidth: '1px', width: '220px', borderRadius: '12px' }}
        >
          <Image src="/svg/search.svg" alt="Search Icon" width={18} height={18} />
          <input
            type="text"
            placeholder="Search"
            className="ml-3 bg-transparent outline-none placeholder-gray-500 text-black text-sm"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex items-center space-x-5">
        {/* Home */}
        <Link href={routes.pages.home} legacyBehavior>
          <a className={`group flex items-center justify-center px-3 py-2 rounded-full transition-all duration-300 ease-in-out
                        ${isActive(routes.pages.home) ? 'bg-[#E4FCDE] text-[#22C55E]' : 'text-[#787070] hover:bg-[#f0fdf4] hover:text-[#22C55E]'}`}
             style={{ minWidth: '80px' }}
          >
            <div 
              className="relative flex items-center justify-center transform transition-transform duration-300 ease-out group-hover:scale-105" 
              style={{ width: 30, height: 30 }}
            >
              <Image
                src="/svg/home_gray.svg"
                alt="Home Icon Gray"
                width={23}
                height={23}
                className={`${isActive(routes.pages.home) ? 'hidden' : 'block'} group-hover:hidden`}
              />
              <Image
                src="/svg/home.svg"
                alt="Home Icon Colored"
                width={23}
                height={23}
                className={`${isActive(routes.pages.home) ? 'block' : 'hidden'} group-hover:block`}
              />
            </div>
            <span className={`ml-2 font-bold text-[16px] transition-opacity duration-300 ease-in-out ${isActive(routes.pages.home) ? 'inline-block text-[#22C55E]' : 'opacity-0 group-hover:opacity-100 text-[#22C55E]'}`}
                  style={{ minWidth: '50px', textAlign: 'center' }}
            >
              Home
            </span>
          </a>
        </Link>

        {/* Profile */}
        <Link href={routes.pages.profile} legacyBehavior>
          <a className={`group flex items-center justify-center px-3 py-2 rounded-full transition-all duration-300 ease-in-out
                        ${isActive(routes.pages.profile) ? 'bg-[#E4FCDE] text-[#22C55E]' : 'text-[#787070] hover:bg-[#f0fdf4] hover:text-[#22C55E]'}`}
             style={{ minWidth: '80px' }}
          >
            <div 
              className="relative flex items-center justify-center transform transition-transform duration-300 ease-out group-hover:scale-105" 
              style={{ width: 30, height: 30 }}
            >
              <Image
                src="/svg/profile_gray.svg"
                alt="Profile Icon Gray"
                width={23}
                height={23}
                className={`${isActive(routes.pages.profile) ? 'hidden' : 'block'} group-hover:hidden`}
              />
              <Image
                src="/svg/profile.svg"
                alt="Profile Icon Colored"
                width={23}
                height={23}
                className={`${isActive(routes.pages.profile) ? 'block' : 'hidden'} group-hover:block`}
              />
            </div>
            <span className={`ml-2 font-bold text-[16px] transition-opacity duration-300 ease-in-out ${isActive(routes.pages.profile) ? 'inline-block text-[#22C55E]' : 'opacity-0 group-hover:opacity-100 text-[#22C55E]'}`}
                  style={{ minWidth: '50px', textAlign: 'center' }}
            >
              Profile
            </span>
          </a>
        </Link>

        {/* About */}
        <Link href={routes.pages.about} legacyBehavior>
          <a className={`group flex items-center justify-center px-3 py-2 rounded-full transition-all duration-300 ease-in-out
                        ${isActive(routes.pages.about) ? 'bg-[#E4FCDE] text-[#22C55E]' : 'text-[#787070] hover:bg-[#f0fdf4] hover:text-[#22C55E]'}`}
             style={{ minWidth: '80px' }}
          >
            <div 
              className="relative flex items-center justify-center transform transition-transform duration-300 ease-out group-hover:scale-105" 
              style={{ width: 30, height: 30 }}
            >
              <Image
                src="/svg/about_gray.svg"
                alt="About Icon Gray"
                width={25}
                height={25}
                className={`${isActive(routes.pages.about) ? 'hidden' : 'block'} group-hover:hidden`}
              />
              <Image
                src="/svg/about.svg"
                alt="About Icon Colored"
                width={25}
                height={25}
                className={`${isActive(routes.pages.about) ? 'block' : 'hidden'} group-hover:block`}
              />
            </div>
            <span className={`ml-2 font-bold text-[16px] transition-opacity duration-300 ease-in-out ${isActive(routes.pages.about) ? 'inline-block text-[#22C55E]' : 'opacity-0 group-hover:opacity-100 text-[#22C55E]'}`}
                  style={{ minWidth: '50px', textAlign: 'center' }}
            >
              About
            </span>
          </a>
        </Link>

        {/* Logout */}
        <a
          className="flex items-center justify-center px-5 py-3 cursor-pointer text-[#787070] hover:text-[#22C55E] transition-transform duration-300 ease-out transform hover:scale-105 rounded-full"
          onClick={handleConfirmLogout}
        >
          <span className="ml-4 text-black font-light text-[16px]">
            Log out
          </span>
        </a>
      </div>

      {/* Logout Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-lg p-6 w-[300px] text-center"
            style={{
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)', // Outer drop shadow
              filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))', // Inner shadow effect
            }}
          >
            <h2 className="text-lg font-semibold text-black mb-4">
            Are you sure you want to Logout?
            </h2>
            <div className="flex justify-around">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
              >
                Yes
              </button>
              <button
                onClick={handleModalClose}
                className="bg-gray-300 text-black px-4 py-2 rounded-lg hover:bg-gray-400 transition"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
