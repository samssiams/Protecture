// components/modal-createcommunity.js

import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import ApprovalCommunityModal from './modal-communityapproval';
import axios from 'axios';

export default function CreateCommunityModal({ isOpen, onClose }) {
  const [communityName, setCommunityName] = useState('');
  const [communityPurpose, setCommunityPurpose] = useState('');
  const [isApprovalOpen, setIsApprovalOpen] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // New loading state

  if (!isOpen) return null;

  const handleCreateCommunity = async () => {
    setError(null);
    setLoading(true); // Start loading indicator
    try {
      const response = await axios.post('/api/community/create-community', {
        name: communityName,
        description: communityPurpose,
      });

      if (response.status === 201) {
        // Delay showing the approval modal until loading is complete
        setIsApprovalOpen(true);
        setCommunityName('');
        setCommunityPurpose('');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false); // Stop loading indicator
    }
  };

  const handleAccept = () => {
    setIsApprovalOpen(false);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-[5px] shadow-lg p-5 relative"
          style={{
            width: '467px',
            minHeight: '346px',
            border: '1px solid black',
          }}
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-[22px] font-semibold text-black mb-0 -mt-3">
              Create a Community
            </h2>
            <button onClick={onClose} className="focus:outline-none flex items-center mb-3">
              <Image src="/svg/eks.svg" alt="Close" width={15} height={15} />
            </button>
          </div>

          <hr
            className="border-t border-black"
            style={{ borderWidth: '.05px', width: 'calc(100% + 40px)', margin: '0 -20px' }}
          />

          {/* Community Name Input */}
          <div className="mb-6 mt-5">
            <label className="block text-black font-bold text-[18px] mb-2">Community Name</label>
            <input
              type="text"
              placeholder="Enter the community name"
              style={{ backgroundColor: 'transparent', border: 'none' }}
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className="w-full h-[40px] px-3 rounded-[4px] border border-gray-300 text-black focus:outline-none focus:border-gray-500"
            />
          </div>

          {/* Community Purpose Textarea */}
          <div className="mb-6">
            <label className="block text-black font-bold text-[18px] mb-2">Community Purpose</label>
            <textarea
              placeholder="Enter the purpose of your community"
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                overflowWrap: 'break-word',
                minHeight: '80px',
                resize: 'none',
              }}
              value={communityPurpose}
              onChange={(e) => setCommunityPurpose(e.target.value)}
              className="w-full px-3 py-2 rounded-[4px] border border-gray-300 text-black focus:outline-none focus:border-gray-500"
              rows={3}
            />
          </div>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          {/* Create Community Button */}
          <button
            onClick={handleCreateCommunity}
            className="w-full h-[40px] font-semibold rounded transition duration-300 flex items-center justify-center"
            style={{
              border: '1px solid #22C55E',
              color: '#22C55E',
              backgroundColor: 'white',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#22C55E';
              e.target.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.color = '#22C55E';
            }}
            disabled={loading} // Disable button during loading
          >
            {loading ? 'Loading...' : 'Create Community'}
          </button>
        </motion.div>
      </div>

      {/* Approval Community Modal */}
      <ApprovalCommunityModal
        isOpen={isApprovalOpen}
        onClose={handleAccept}
      />
    </>
  );
}
