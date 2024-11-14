import Image from 'next/image';
import { useEffect, useState, useRef } from 'react';
import ModalDots from '../../pages/home/profile/modal-dots'; // Import the dots modal
import CommentModal from '../../pages/home/modal-comment';

function PostContainer() {
  const [userData, setUserData] = useState(null); // State to store the fetched user data
  const [showModal, setShowModal] = useState(false); // State to control dots modal visibility
  const [showCommentModal, setShowCommentModal] = useState(false); // State to control comment modal visibility
  const [modalPosition, setModalPosition] = useState({ left: 0, top: 0 }); // Store the position of the modal for dots
  const modalRef = useRef(null); // Ref to the modal for detecting clicks outside
  const [comments, setComments] = useState([]); // Comments state

  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserData(data); // Set the user data to state
        } else {
          console.error("Error fetching user profile");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle opening or closing the dots modal when dots are clicked
  const handleModalToggle = (event) => {
    const position = {
      left: event.clientX,
      top: event.clientY,
    };
    setModalPosition(position); // Set the position state
    setShowModal((prevShowModal) => !prevShowModal); // Toggle the modal visibility
  };

  // Handle opening the comment modal when the comment icon is clicked
  const handleCommentModalToggle = () => {
    setShowCommentModal((prevShowModal) => !prevShowModal); // Toggle the comment modal visibility
  };

  // Handle closing the modal when clicking outside
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setShowModal(false); // Close the modal if clicked outside
    }
  };

  useEffect(() => {
    // Event listener to close the modal when clicking outside
    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside); // Clean up event listener
    };
  }, [showModal]);

  if (!userData) {
    return <div>Loading...</div>; // Show loading state if user data is not yet fetched
  }

  return (
    <div
      className="bg-white rounded-[15px] shadow-lg p-5"
      style={{
        width: '656px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
      }}
    >
      {/* Header Section */}
      <div className="flex items-center mb-4">
        <Image
          src={userData.profileImg} // Use the user's profile image
          alt="Profile"
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="ml-4">
          <h3 className="font-bold text-black">{userData.name || userData.username}</h3> {/* Use the name or username */}
          <span className="text-black text-xs">14:30</span> {/* Smaller font size for time */}
        </div>
        <div className="ml-auto">
          <button onClick={handleModalToggle}>
            <Image src="/svg/dots.svg" alt="Options" width={4} height={16} />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <p className="text-[#4A4A4A] mb-4">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      </p>
      <span className="inline-block bg-[#DFFFD6] text-[#22C55E] text-sm font-semibold py-1 px-3 rounded-lg mb-4">
        Modern House
      </span>
      <div className="bg-gray-300 flex items-center justify-center rounded-lg h-[250px] mb-4">
        <span className="text-black text-lg">Image</span>
      </div>

      {/* Reaction Section */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <button>
            <Image src="/svg/downvote.svg" alt="Downvote" width={21} height={21} />
          </button>
          <span className="text-black">143</span>
          <button>
            <Image src="/svg/upvote.svg" alt="Upvote" width={21} height={21} />
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handleCommentModalToggle}>
            <Image src="/svg/comments.svg" alt="Comments" width={21} height={21} />
          </button>
          <span className="text-black">143</span>
        </div>
      </div>

      {/* Modal Component (only show when the modal is triggered) */}
      {showModal && (
        <div ref={modalRef}>
          <ModalDots
            isOpen={showModal}
            onClose={() => setShowModal(false)} // Close the modal
            position={modalPosition}
          />
        </div>
      )}

      {/* Comment Modal Component */}
      {showCommentModal && (
        <CommentModal
          isOpen={showCommentModal}
          onClose={() => setShowCommentModal(false)} // Close the comment modal
          comments={comments} // Pass the comments data
          userData={userData} // Pass the user data
        />
      )}
    </div>
  );
}

export default PostContainer;
