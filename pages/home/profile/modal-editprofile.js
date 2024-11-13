import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function EditProfileModal({ isOpen, onClose, currentProfileData, onProfileUpdate }) {
  const profileInputRef = useRef(null);
  const headerInputRef = useRef(null);
  const [name, setName] = useState(currentProfileData?.name || '');
  const [username, setUsername] = useState(currentProfileData?.username || '');
  const [profileImage, setProfileImage] = useState(currentProfileData?.profile_img || '');
  const [headerImage, setHeaderImage] = useState(currentProfileData?.header_img || '');
  
  const [tempProfileImage, setTempProfileImage] = useState('');
  const [tempHeaderImage, setTempHeaderImage] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setName(currentProfileData?.name || '');
      setUsername(currentProfileData?.username || '');
      setProfileImage(currentProfileData?.profile_img || '');
      setHeaderImage(currentProfileData?.header_img || '');
      setTempProfileImage('');
      setTempHeaderImage('');
      setErrorMessage('');
    }
  }, [isOpen, currentProfileData]);

  const handleProfileFileClick = () => profileInputRef.current.click();
  const handleHeaderFileClick = () => headerInputRef.current.click();

  const uploadImage = async (file, endpoint) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Image upload failed');
      }

      const data = await response.json();
      return data.fileUrl;
    } catch (error) {
      setErrorMessage(error.message || 'Failed to upload image.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const validExtensions = ["image/jpeg", "image/png"];
    if (!validExtensions.includes(file.type)) {
      setErrorMessage("Only JPG and PNG files are allowed.");
      return;
    }

    try {
      const endpoint = type === 'profile'
        ? '/api/user/uploadProfileImage'
        : '/api/user/uploadHeaderImage';
      const fileUrl = await uploadImage(file, endpoint);

      if (type === 'profile') setTempProfileImage(fileUrl);
      else setTempHeaderImage(fileUrl);
    } catch {}
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage('');

    const updatedData = {
      name: name || currentProfileData?.name || '',
      username: username || currentProfileData?.username || '',
      profile_img: tempProfileImage || profileImage || currentProfileData?.profile_img || '',
      header_img: tempHeaderImage || headerImage || currentProfileData?.header_img || '',
    };

    try {
      const response = await fetch('/api/user/editProfile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error('Profile update failed');
      
      // Immediately update images and other profile data in the parent component
      onProfileUpdate(updatedData);
      
      setProfileImage(tempProfileImage || profileImage);
      setHeaderImage(tempHeaderImage || headerImage);
      setTempProfileImage('');
      setTempHeaderImage('');
      
      // Show success modal after saving
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 2000); // Show success modal for 2 seconds, then close
    } catch (error) {
      setErrorMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-white rounded-[5px] shadow-lg p-6 border border-black"
        style={{
          width: '500px',
          height: 'auto',
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15)',
          borderWidth: '1px',
        }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[24px] font-semibold text-black mb-.1 -mt-3">Edit Profile</h2>
          <button onClick={onClose} className="focus:outline-none flex items-center mb-3">
            <Image src="/svg/eks.svg" alt="Close" width={15} height={15} />
          </button>
        </div>

        <hr className="border-t border-black" style={{ borderWidth: '0.5px', width: 'calc(100% + 50px)', margin: '0 -25px' }} />

        {/* Profile Picture Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[18px] mt-5 text-black font-bold">Profile Picture</p>
            <button onClick={handleProfileFileClick} className="mt-5 text-[#22C55E] font-bold">Edit</button>
          </div>
          <div className="flex flex-col items-center mt-10 mb-8" onClick={handleProfileFileClick} style={{ cursor: 'pointer' }}>
            {(tempProfileImage || profileImage) ? (
              <Image src={tempProfileImage || profileImage} alt="Profile" width={100} height={100} className="rounded-full border-4 border-white" />
            ) : (
              <Image src="/svg/addimage.svg" alt="Add Image" width={25} height={25} />
            )}
            <span className="text-gray-500 mt-2">{(tempProfileImage || profileImage) ? "Change Image" : "Add Image"}</span>
          </div>
          <input
            type="file"
            ref={profileInputRef}
            style={{ display: 'none' }}
            accept=".jpg, .jpeg, .png"
            onChange={(e) => handleFileChange(e, 'profile')}
          />
        </div>

        {/* Header Profile Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[18px] text-black font-bold">Header Profile</p>
            <button onClick={handleHeaderFileClick} className="text-[#22C55E] font-bold">Edit</button>
          </div>
          <div className="flex flex-col items-center mt-10 mb-8" onClick={handleHeaderFileClick} style={{ cursor: 'pointer' }}>
            {(tempHeaderImage || headerImage) ? (
              <Image src={tempHeaderImage || headerImage} alt="Header" width={300} height={100} className="rounded-md" />
            ) : (
              <Image src="/svg/addimage.svg" alt="Add Image" width={25} height={25} />
            )}
            <span className="text-gray-500 mt-2">{(tempHeaderImage || headerImage) ? "Change Image" : "Add Image"}</span>
          </div>
          <input
            type="file"
            ref={headerInputRef}
            style={{ display: 'none' }}
            accept=".jpg, .jpeg, .png"
            onChange={(e) => handleFileChange(e, 'header')}
          />
        </div>

        <hr className="border-t border-gray-400 mb-8" style={{ height: '0.1px', margin: '0' }} />

        {/* Name and Username Fields */}
        <div className="mb-6">
          <label className="text-[18px] text-black font-bold mb-1 mt-5 block">Name</label>
          <input
            type="text"
            placeholder="Enter your new name"
            className="border border-gray-400 rounded-[5px] focus:outline-none w-full h-[38px] px-3 text-gray-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-10">
          <label className="text-[18px] text-black font-bold mb-2 block">Username</label>
          <input
            type="text"
            placeholder="Enter your new username"
            className="border border-gray-400 rounded-[5px] focus:outline-none w-full h-[38px] px-3 text-gray-700"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`bg-[#22C55E] text-white font-semibold rounded-[5px] w-full h-[38px] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Saving...' : 'Save'}
        </button>

        {/* Error Message */}
        {errorMessage && (
          <p className="text-red-600 text-center mt-4">{errorMessage}</p>
        )}
      </motion.div>

      {/* Success Modal */}
      {showSuccessModal && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="bg-white rounded-lg p-6 shadow-lg border border-green-600"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-green-600 font-bold text-center">Profile updated successfully!</p>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
