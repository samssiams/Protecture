import Image from 'next/image';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ReportUserModal from '../../modal-reportuser'; // Import the ReportUserModal

export default function DotsMenu({ isOpen, onClose, position, postId, reporterId }) {
  const [isReportModalOpen, setReportModalOpen] = useState(false); // State to control the report modal visibility
  const modalRef = useRef(null);

useEffect(() => {
  const handleClickOutside = (event) => {
    // Don't trigger onClose if the ReportUserModal is open
    if (isReportModalOpen) return;
    // If click is within DotsMenu, or on elements marked with .modal-button or .report-user-modal, do nothing
    if (
      modalRef.current &&
      (modalRef.current.contains(event.target) ||
        event.target.closest(".modal-button") ||
        event.target.closest(".report-user-modal"))
    ) {
      return;
    }
    onClose();
  };

  if (isOpen) {
    document.addEventListener("mousedown", handleClickOutside);
  }
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [isOpen, onClose, isReportModalOpen]);


  if (!isOpen) return null;

  const openReportModal = () => setReportModalOpen(true);
  const closeReportModal = () => setReportModalOpen(false);

  return (
    <>
      <motion.div
        ref={modalRef}
        className="absolute bg-white rounded-[5px] border border-black shadow-lg"
        style={{
          width: "129px",
          height: "46px",
          left: position.left - 135,
          top: position.top - 15,
          boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
          borderWidth: "1px",
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-col p-2">
          <button
            className="modal-button flex items-center space-x-2 w-full text-left hover:bg-gray-100 p-1 rounded"
            onClick={openReportModal}
          >
            <Image
              src="/svg/reportuser.svg"
              alt="Report"
              width={13}
              height={13}
            />
            <span
              className="text-red-500 font-medium"
              style={{ fontSize: "13px" }}
            >
              Report Post
            </span>
          </button>
        </div>
      </motion.div>

      {/* Wrap ReportUserModal with a container that has the 'report-user-modal' class */}
      <div className="report-user-modal">
        <ReportUserModal
          isOpen={isReportModalOpen}
          onClose={closeReportModal}
          postId={postId}
          reporterId={reporterId}
        />
      </div>
    </>
  );
}
