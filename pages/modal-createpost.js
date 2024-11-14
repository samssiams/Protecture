import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function CreatePostModal({ isOpen, onClose, userData }) {
  const [selectedImage, setSelectedImage] = useState(null);

  // Log the userData to check if it's passed correctly
  console.log('User data:', userData);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(URL.createObjectURL(file));
    }
  };

  const triggerFileInput = () => {
    document.getElementById('fileInput').click();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[5px] shadow-lg p-5 relative"
        style={{
          width: '500px',
          height: '500px',
          border: '1px solid black',
        }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-[24px] font-semibold text-black mb-0 -mt-4">Create a Post</h2>
          <button onClick={onClose} className="focus:outline-none flex items-center mb-4">
            <Image src="/svg/eks.svg" alt="Close" width={15} height={15} />
          </button>
        </div>

        <hr
          className="border-t border-black"
          style={{ borderWidth: '.05px', width: 'calc(100% + 40px)', margin: '0 -20px' }}
        />

        {/* Profile Information */}
        <div className="flex items-center mt-4 mb-4">
          {/* Log user profile image to check if it's correct */}
          <Image
            src={userData?.profileImg || '/images/user.png'} // Use userData.profileImage or fallback to default
            alt="Profile Image"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="ml-3">
            {/* Log user name to verify it */}
            <p className="text-black font-semibold text-[16px]">{userData?.name || 'Joexsu'}</p> {/* Display the user's name */}
          </div>
        </div>

        {/* Text Area for Post Content */}
        <div className="mb-1">
          <textarea
            className="w-full h-[80px] px-3 text-black text-[14px] resize-none focus:outline-none placeholder-gray-500"
            placeholder="What will you post?"
            style={{ backgroundColor: 'transparent', border: 'none' }}
          />
        </div>

        {/* Dropdown for Category Selection */}
        <div className="relative mb-4">
          <select
            className="w-full h-[40px] px-3 rounded-[4px] bg-[#F4F3F3] text-black appearance-none"
            style={{ border: '1px solid #E0E0E0' }}
          >
            <option>Select the house style category</option>
            <option>Modern</option>
            <option>Contemporary</option>
            <option>Victorian</option>
            <option>Traditional</option>
          </select>
          <Image
            src="/svg/drop.svg"
            alt="Dropdown Icon"
            width={12}
            height={12}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Add Image Section */}
        <div
          className="w-full h-[150px] bg-gray-800 flex flex-col items-center justify-center rounded cursor-pointer"
          onClick={triggerFileInput}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {selectedImage ? (
            <Image src={selectedImage} alt="Selected" layout="fill" objectFit="cover" className="h-full rounded" />
          ) : (
            <>
              <Image src="/svg/addimagewhite.svg" alt="Upload Icon" width={20} height={20} />
              <span className="text-gray-300 mt-2">Add Image</span>
            </>
          )}
        </div>

        {/* Post Button */}
        <button className="w-full h-[40px] bg-[#28B446] text-white font-semibold rounded mt-4">
          Post
        </button>
      </motion.div>
    </div>
  );
}
