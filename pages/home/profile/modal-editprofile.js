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
  const [profileFile, setProfileFile] = useState(null);
  const [headerFile, setHeaderFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setProfileImage(currentProfileData?.profile_img || '');
      setHeaderImage(currentProfileData?.header_img || '');
      setTempProfileImage('');
      setTempHeaderImage('');
      setProfileFile(null);
      setHeaderFile(null);
      setMessage('');
      setName(currentProfileData?.name || '');
      setUsername(currentProfileData?.username || '');
    }
  }, [isOpen, currentProfileData]);

  const handleProfileFileClick = () => profileInputRef.current.click();
  const handleHeaderFileClick = () => headerInputRef.current.click();

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const validExtensions = ['image/jpeg', 'image/png'];
    if (!validExtensions.includes(file.type)) {
      setMessage('Only JPG and PNG files are allowed.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    if (type === 'profile') {
      setTempProfileImage(previewUrl);
      setProfileFile(file);
    } else {
      setTempHeaderImage(previewUrl);
      setHeaderFile(file);
    }
  };

  const uploadImage = async (file, endpoint) => {
    const formData = new FormData();
    formData.append('file', file);

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
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      let profileImageUrl = profileImage;
      let headerImageUrl = headerImage;

      if (profileFile) {
        profileImageUrl = await uploadImage(profileFile, '/api/user/uploadProfileImage');
      }

      if (headerFile) {
        headerImageUrl = await uploadImage(headerFile, '/api/user/uploadHeaderImage');
      }

      const updatedData = {
        name: name || currentProfileData?.name || '',
        username: username || currentProfileData?.username || '',
        profile_img: profileImageUrl,
        header_img: headerImageUrl,
      };

      // Log the updated data before sending it
      console.log('Sending data:', updatedData);

      const response = await fetch('/api/user/editProfile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Profile update failed');
      }

      onProfileUpdate(updatedData);
      setMessage('Profile updated successfully');
      setProfileImage(profileImageUrl);
      setHeaderImage(headerImageUrl);
      setTempProfileImage('');
      setTempHeaderImage('');
      setProfileFile(null);
      setHeaderFile(null);

      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage(error.message || 'Failed to update profile.');
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
          <div className="flex flex-col items-center mt-10 mb-8" style={{ cursor: 'pointer' }}>
            <div
              onClick={handleProfileFileClick}
              className="relative rounded-full overflow-hidden w-[100px] h-[100px] border-4 border-white"
              style={{ backgroundImage: `url(${tempProfileImage || profileImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {!tempProfileImage && !profileImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src="/svg/addimage.svg" alt="Add Image" width={24} height={24} />
                </div>
              )}
            </div>
            <span className="text-gray-500 mt-2">{(tempProfileImage || profileImage) ? 'Change Image' : 'Add Image'}</span>
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
            <div
              className="relative rounded-md overflow-hidden w-[300px] h-[100px]"
              style={{ backgroundImage: `url(${tempHeaderImage || headerImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              {!tempHeaderImage && !headerImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Image src="/svg/addimage.svg" alt="Add Image" width={24} height={24} />
                </div>
              )}
            </div>
            <span className="text-gray-500 mt-2">{(tempHeaderImage || headerImage) ? 'Change Image' : 'Add Image'}</span>
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

        {/* Message Display */}
        {message && (
          <p className={`text-center mt-4 ${message.includes('failed') ? 'text-red-600' : 'text-green-600'}`}>{message}</p>
        )}
      </motion.div>
    </motion.div>
  );
}
