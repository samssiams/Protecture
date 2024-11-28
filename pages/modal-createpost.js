import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useRouter } from 'next/router';

export default function CreatePostModal({ isOpen, onClose, userData }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false); // Loading state to track post creation
  const [error, setError] = useState(null); // Error state
  const [warning, setWarning] = useState(null); // Warning state for profanity
  const router = useRouter(); // Initialize router for reloading the page

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const triggerFileInput = () => {
    document.getElementById('fileInput').click();
  };

  // List of banned words
  const bannedWords = [
    // English Profanity
    "fuck", "fucking", "shit", "damn", "bitch", "asshole", "bastard", 
    "dick", "cunt", "piss", "crap", "slut", "whore", "prick", "fag", 
    "nigger", "motherfucker", "cock", "pussy", "retard", "douche", 
    "bullshit", "arsehole", "wanker", "tosser", "bloody", "bugger",
    "fvck", "fck", "fcking", "mf" , "dfq" , "dick" , "pussy" , "MotherFucker" ,
  
    // Tagalog Profanity
    "putangina", "gago", "tanga", "bobo", "ulol", "lintik", "hinayupak", 
    "hayop", "siraulo", "tarantado", "bwisit", "tite", "pakyu", 
    "pakyew", "leche", "punyeta", "inutil", "unggoy", "peste", 
    "gunggong", "salot", "walanghiya", "ampota", "syet", "gago", 
    "putcha", "punyemas", "hudas", "diyablo", "g@go", "8080", "kingina", "kupal",
    "t4nga", "b0b0", "inutil", "pakyu", "shet", "t4nga", "obob", "bob0",
    "kinangina" , "tangina" , "hayuf" , "hayf" ,"inamo" , "namo"
  ];
  

  const containsProfanity = (text) => {
    const regex = new RegExp(`\\b(${bannedWords.join('|')})\\b`, 'gi');
    return regex.test(text);
  };

  const sanitizeText = (text) => {
    const regex = new RegExp(`\\b(${bannedWords.join('|')})\\b`, 'gi');
    return text.replace(regex, (match) => '*'.repeat(match.length));
  };

  const handleDescriptionChange = (e) => {
    const inputText = e.target.value;
    if (containsProfanity(inputText)) {
      setWarning('Your text contains inappropriate language. It will be filtered.');
    } else {
      setWarning(null);
    }
    setDescription(sanitizeText(inputText)); // Automatically sanitize text
  };

  const handlePost = async () => {
    setLoading(true); // Set loading to true when the post is being submitted
    setError(null); // Clear any previous errors

    // Create a FormData object
    const formData = new FormData();
    formData.append('description', description);
    formData.append('category_id', category);
    formData.append('image', selectedImage); // Image is appended as a file

    try {
      // Send the post request with FormData
      const response = await axios.post('/api/post/createpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Important for sending FormData
        },
      });

      if (response.status === 201) {
        // Reload the entire page upon successful post creation
        router.reload();
      } else {
        setError('Failed to create post. Please try again.');
      }
    } catch (err) {
      // Handle error during post creation
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
      className="bg-white rounded-[5px] shadow-lg p-5 relative modal-container"
        style={{
          width: '500px',
          minheight: '200px',
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
            <p className="text-black font-semibold text-[16px]">{userData?.name || 'Anonymous'}</p>
          </div>
        </div>

        {/* Text Area for Post Content */}
        <div className="mb-1">
          <textarea
            className="w-full h-[80px] px-3 text-black text-[14px] resize-none focus:outline-none placeholder-gray-500"
            placeholder="What will you post?"
            style={{ backgroundColor: 'transparent', border: 'none' }}
            value={description}
            onChange={handleDescriptionChange}
          />
        </div>
        {warning && <p className="text-red-500 font-regular text-center mt-2 mb-2">{warning}</p>}

        {/* Dropdown for Category Selection */}
        <div className="relative mb-4">
          <select
            className="w-full h-[40px] px-3 rounded-[4px] bg-[#F4F3F3] text-black appearance-none"
            style={{ border: '1px solid #E0E0E0' }}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Select the house style category</option>
            <option value="Modern">Modern</option>
            <option value="Contemporary">Contemporary</option>
            <option value="Victorian">Victorian</option>
            <option value="Traditional">Traditional</option>
            <option value="Bungalow">Bungalow</option>
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
