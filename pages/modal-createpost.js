import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import axios from 'axios';

export default function CreatePostModal({ isOpen, onClose, userData }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false); // Loading state to track post creation
  const [error, setError] = useState(null); // Error state

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('fileInput').click();
  };

  const handlePost = async () => {
    setLoading(true); // Set loading to true when the post is being submitted
    setError(null); // Clear any previous errors

    // Create a FormData object
    const formData = new FormData();
    formData.append('description', description);
    formData.append('category_id', category);
    formData.append('image', selectedImage); // Image is appended as a file

    // Log FormData for debugging
    console.log('FormData keys and values:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}:`, pair[1]);
    }

    try {
      // Send the post request with FormData
      const response = await axios.post('/api/post/createpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for sending FormData
        },
      });

      console.log('Post response:', response); // Add this to inspect the response from the server

      if (response.status === 201) {
        // Post created successfully, close the modal
        onClose();
        setSelectedImage(null);
        setDescription('');
        setCategory('');
      } else {
        console.error('Failed to create post, response:', response); // Log any response error from server
        setError('Failed to create post. Please try again.');
      }
    } catch (err) {
      // Handle error during post creation
      console.error('Error creating post:', err.response ? err.response.data : err); // Improved error logging
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false); // Set loading to false when done
    }
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
          <Image
            src={userData?.profileImg || '/images/user.png'} // Use userData.profileImage or fallback to default
            alt="Profile Image"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="ml-3">
            <p className="text-black font-semibold text-[16px]">{userData?.name || 'Joexsu'}</p>
          </div>
        </div>

        {/* Text Area for Post Content */}
        <div className="mb-1">
          <textarea
            className="w-full h-[80px] px-3 text-black text-[14px] resize-none focus:outline-none placeholder-gray-500"
            placeholder="What will you post?"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Dropdown for Category Selection */}
        <div className="relative mb-4">
          <select
            className="w-full h-[40px] px-3 rounded-[4px] bg-[#F4F3F3] text-black appearance-none"
            style={{ border: '1px solid #E0E0E0' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Select the house style category</option>
            <option>Modern</option>
            <option>Contemporary</option>
            <option>Victorian</option>
            <option>Traditional</option>
            <option>Bungalow</option>
          </select>
          <Image
            src="/svg/drop.svg"
            alt="Dropdown Icon"
            width={12}
            height={12}
            className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none"
          />
        </div>

        {/* Add Image Section with Preview */}
        <div
          className="w-full h-[150px] bg-gray-800 flex flex-col items-center justify-center rounded cursor-pointer overflow-hidden"
          onClick={triggerFileInput}
          style={{
            position: 'relative',
          }}
        >
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          {selectedImage ? (
            <Image
              src={URL.createObjectURL(selectedImage)} // Create an object URL for the image preview
              alt="Selected"
              layout="fill"
              objectFit="cover"
              className="rounded"
            />
          ) : (
            <>
              <Image src="/svg/addimagewhite.svg" alt="Upload Icon" width={20} height={20} />
              <span className="text-gray-300 mt-2">Add Image</span>
            </>
          )}
        </div>

        {/* Error and Loading states */}
        {error && (
          <p className="text-red-500 text-center mt-3">{error}</p>
        )}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-[5px]">
            <p className="text-white text-[18px] font-semibold">Posting...</p>
          </div>
        )}

        {/* Post Button */}
        <button
          onClick={handlePost}
          className="w-full h-[40px] bg-[#28B446] text-white font-semibold rounded mt-4"
          disabled={loading} // Disable button while posting
        >
          {loading ? 'Posting...' : 'Post'}
        </button>
      </motion.div>
    </div>
  );
}
