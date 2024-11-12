import Image from 'next/image';

function PostContainer() {
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
          <Image src="/images/user.png" alt="Profile" width={40} height={40} className="rounded-full" />
          <div className="ml-4">
            <h3 className="font-bold text-black">Joexsu</h3>
            <span className="text-black text-xs">14:30</span> {/* Smaller font size for time */}
          </div>
          <div className="ml-auto">
            <button>
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
            <button>
              <Image src="/svg/comments.svg" alt="Comments" width={21} height={21} />
            </button>
            <span className="text-black">143</span>
          </div>
        </div>
      </div>
    );
}

export default PostContainer;