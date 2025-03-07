import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function EditProfileModal({ isOpen, onClose, currentProfileData, onProfileUpdate }) {
  const profileInputRef = useRef(null);
  const headerInputRef = useRef(null);

  const [name, setName] = useState('');
  // Store file objects if the user chooses new images.
  const [profileFile, setProfileFile] = useState(null);
  const [headerFile, setHeaderFile] = useState(null);
  // Use preview URLs for display.
  const [profilePreview, setProfilePreview] = useState('');
  const [headerPreview, setHeaderPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    if (isOpen && currentProfileData) {
      setName(currentProfileData.name || '');
      setProfilePreview(currentProfileData.profile_img || '');
      setHeaderPreview(currentProfileData.header_img || '');
      // Reset file objects when opening the modal.
      setProfileFile(null);
      setHeaderFile(null);
      setErrorMessage('');
    }
  }, [isOpen, currentProfileData]);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleProfileFileClick = () => profileInputRef.current.click();
  const handleHeaderFileClick = () => headerInputRef.current.click();

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    const previewUrl = URL.createObjectURL(file);
    if (type === 'profile') {
      setProfileFile(file);
      setProfilePreview(previewUrl);
    } else if (type === 'header') {
      setHeaderFile(file);
      setHeaderPreview(previewUrl);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const formData = new FormData();
      // Always include the name.
      formData.append('name', name);
      // Append files only if the user selected a new image.
      if (profileFile) formData.append('profile_img', profileFile);
      if (headerFile) formData.append('header_img', headerFile);

      const response = await fetch('/api/user/editProfile', {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Profile update failed');
      }

      // Update the parent component with the new data.
      onProfileUpdate({
        name,
        profile_img: profilePreview,
        header_img: headerPreview,
      });

      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        onClose();
      }, 2000);
    } catch (error) {
      setErrorMessage(error.message || 'Failed to update profile.');
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
          <h2 className="text-[24px] font-semibold text-black">Edit Profile</h2>
          <button onClick={onClose} className="focus:outline-none flex items-center">
            <Image src="/svg/eks.svg" alt="Close" width={15} height={15} />
          </button>
        </div>
        <hr
          className="border-t border-black"
          style={{ borderWidth: '0.5px', width: 'calc(100%+50px)', margin: '0 -25px' }}
        />

        {/* Profile Picture Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[18px] mt-5 text-black font-bold">Profile Picture</p>
            <button onClick={handleProfileFileClick} className="mt-5 text-[#22C55E] font-bold">
              Edit
            </button>
          </div>
          <div
            className="flex flex-col items-center mt-10 mb-8"
            onClick={handleProfileFileClick}
            style={{ cursor: 'pointer' }}
          >
            {profilePreview ? (
              <Image
                src={profilePreview}
                alt="Profile"
                width={100}
                height={100}
                className="rounded-full border-4 border-white"
              />
            ) : (
              <Image src="/svg/addimage.svg" alt="Add Image" width={25} height={25} />
            )}
            <span className="text-gray-500 mt-2">
              {profilePreview ? 'Change Image' : 'Add Image'}
            </span>
          </div>
          <input
            type="file"
            ref={profileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'profile')}
          />
        </div>

        {/* Header Picture Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[18px] text-black font-bold">Header Profile</p>
            <button onClick={handleHeaderFileClick} className="text-[#22C55E] font-bold">
              Edit
            </button>
          </div>
          <div
            className="flex flex-col items-center mt-10 mb-8"
            onClick={handleHeaderFileClick}
            style={{ cursor: 'pointer' }}
          >
            {headerPreview ? (
              <Image src={headerPreview} alt="Header" width={300} height={100} className="rounded-md" />
            ) : (
              <Image src="/svg/addimage.svg" alt="Add Image" width={25} height={25} />
            )}
            <span className="text-gray-500 mt-2">
              {headerPreview ? 'Change Image' : 'Add Image'}
            </span>
          </div>
          <input
            type="file"
            ref={headerInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'header')}
          />
        </div>

        <hr className="border-t border-gray-400 mb-8" style={{ height: '0.1px', margin: '0' }} />

        {/* Name Field */}
        <div className="mb-10">
          <label className="text-[18px] text-black font-bold mb-1 mt-5 block">Name</label>
          <input
            type="text"
            placeholder="Enter your new name"
            className="border border-gray-400 rounded-[5px] focus:outline-none w-full h-[38px] px-3 text-gray-700"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={loading}
          className={`bg-[#22C55E] text-white font-semibold rounded-[5px] w-full h-[38px] ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
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
