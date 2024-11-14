import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function CommentModal({ isOpen, onClose, comments, userData }) {
  const [commentText, setCommentText] = useState('');
  const commentInputRef = useRef(null);
  const modalRef = useRef(null); // Reference to the modal content

  useEffect(() => {
    if (isOpen) {
      commentInputRef.current.focus(); // Auto-focus the comment input when modal is opened
    }
  }, [isOpen]);

  // Close modal when clicking outside
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      onClose(); // Close the modal if the click is outside the modal content
    }
  };

  useEffect(() => {
    // Adding event listener for clicks outside the modal
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Clean up event listener
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle comment input
  const handleCommentChange = (e) => {
    setCommentText(e.target.value);
  };

  // Handle submit comment
  const handleCommentSubmit = () => {
    if (commentText) {
      console.log('Comment Submitted:', commentText); // For now just logging it
      setCommentText(''); // Clear the input field after submission
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        className="bg-white rounded-[5px] shadow-lg p-4 w-[800px] relative"
        style={{
          borderRadius: '5px',
          overflow: 'hidden',
          border: '2px solid black', // Border thickness increased to 2px
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)', // Adding drop shadow and inner shadow
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))', // Adding a filter for extra shadow effect
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        ref={modalRef} // Adding reference to modal content
      >
        {/* Header Section */}
        <div
          className="flex justify-between items-center mb-4"
          style={{ paddingLeft: '20px', paddingRight: '20px', position: 'relative' }}
        >
          <h2
            className="text-[#2FA44E] font-bold italic text-[20px] underline"
            style={{
              marginLeft: '1px', paddingLeft: '1px', paddingTop: '10px', textAlign: 'left',
              display: 'inline-block',
            }}
          >
            Download Image
          </h2>
          <button
            onClick={onClose}
            className="focus:outline-none"
            style={{
              position: 'absolute', right: '20px', top: '18px', padding: '0px',
            }}
          >
            <Image
              src="/svg/eks.svg"
              alt="Close"
              width={17}
              height={20}
              className="hover:opacity-70"
            />
          </button>
        </div>

        {/* Image placeholder */}
        <div
          className="text-center bg-[#2C2B2B] rounded-lg mb-8"
          style={{
            width: '740px', height: '400px', marginLeft: 'auto', marginRight: 'auto',
            display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative',
          }}
        >
          <span className="text-white text-xl font-bold italic">Uploaded Image</span>
        </div>

        {/* Reaction Section */}
        <div className="flex justify-between items-center mb-8" style={{ position: 'relative' }}>
          <div
            className="flex items-center space-x-2"
            style={{ position: 'absolute', left: '20px' }} // Left position for downvote and upvote
          >
            <button>
              <Image src="/svg/downvote.svg" alt="Downvote" width={21} height={21} />
            </button>
            <span className="text-black">143</span>
            <button>
              <Image src="/svg/upvote.svg" alt="Upvote" width={21} height={21} />
            </button>
          </div>
          <div
            className="flex items-center space-x-2"
            style={{ position: 'absolute', right: '20px' }} // Right position for comments icon
          >
            <button>
              <Image src="/svg/comments.svg" alt="Comments" width={21} height={21} />
            </button>
            <span className="text-black">143</span>
          </div>
        </div>

        {/* Divider Line */}
        <hr
          className="border-gray-300 w-full mb-8"
          style={{ width: '740px', marginLeft: 'auto', marginRight: 'auto' }}
        />

        {/* Placeholder Text for No Comments */}
        {comments.length === 0 && (
          <div className="text-center text-gray-500 italic mb-4">
            No comments yet. Be the first to comment!
          </div>
        )}

        {/* Comment Input Section */}
        <div className="flex items-center space-x-3 mb-4" style={{ marginLeft: '20px', marginTop: '20px' }}>
          <Image
            src={userData?.profileImg || '/images/user.png'}
            alt="Your Profile"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="relative w-[740px]">
            <input
              type="text"
              value={commentText}
              onChange={handleCommentChange}
              ref={commentInputRef}
              className="w-[680px] h-[41px] rounded-[5px] p-2 bg-[#F4F3F3] text-black pl-2"
              placeholder="Write something"
              style={{
                borderRadius: '5px',
                borderColor: '#787070', // Light border color for focus
                borderWidth: '1px', // Thin border width
                outline: 'none', // Remove the default focus outline
              }}
            />
            <button
              onClick={handleCommentSubmit}
              className="absolute right-7 top-1/2 transform -translate-y-1/2 focus:outline-none"
            >
              <Image
                src="/svg/addcomment.svg"
                alt="Add Comment"
                width={22}
                height={22}
              />
            </button>
          </div>
        </div>

        {/* Comments List */}
        <div className="overflow-y-auto max-h-[300px] mb-1">
          {comments.map((comment, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 mb-2 border-b">
              <Image
                src={comment.userImage || '/images/user.png'}
                alt="User"
                width={40}
                height={40}
                className="rounded-full"
              />
              <div>
                <span className="font-semibold">{comment.username}</span>
                <p className="text-gray-600">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
