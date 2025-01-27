import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ReportUserModal from '../../modal-reportuser'; // Import the ReportUserModal

export default function DotsMenu({ isOpen, onClose, position, postId, reporterId }) {
  const [isReportModalOpen, setReportModalOpen] = useState(false); // State to control the report modal visibility
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target) && !event.target.closest('.modal-button')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const openReportModal = () => setReportModalOpen(true);
  const closeReportModal = () => setReportModalOpen(false);

  return (
    <>
      <motion.div
        ref={modalRef}
        className="absolute bg-white rounded-[5px] border border-black shadow-lg"
        style={{
          width: '145px',
          height: '92px',
          left: position.left - 160,
          top: position.top - 10,
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15), inset 0 2px 6px rgba(0, 0, 0, 0.1)',
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
          borderWidth: '1px',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col p-3 space-y-2">
          <button
            className="flex items-center space-x-2 w-full text-left hover:bg-gray-100 p-1 rounded"
            onClick={onClose}
          >
            <Image src="/svg/unfollow.svg" alt="Unfollow" width={13} height={13} />
            <span className="text-black font-medium" style={{ fontSize: '12px' }}>
              Unfollow User
            </span>
          </button>
          <hr className="border-gray-300 w-full" />
          <button
            className="flex items-center space-x-2 w-full text-left hover:bg-gray-100 p-1 rounded"
            onClick={openReportModal}
          >
            <Image src="/svg/reportuser.svg" alt="Report" width={13} height={13} />
            <span className="text-red-500 font-medium" style={{ fontSize: '12px' }}>
              Report Post
            </span>
          </button>
        </div>
      </motion.div>

      {/* Report User Modal */}
      <ReportUserModal isOpen={isReportModalOpen} onClose={closeReportModal} postId={postId} reporterId={reporterId} />
    </>
  );
}
