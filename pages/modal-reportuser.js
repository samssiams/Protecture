import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ReportUserModal({ isOpen, onClose, postId, reporterId }) {
  const [description, setDescription] = useState('');
  const [reportStatus, setReportStatus] = useState(''); // Tracks the status of the report (success or error)

  if (!isOpen) return null;

  const handleReport = async () => {
    if (!postId || !reporterId) {
      console.error('postId or reporterId is missing!');
      setReportStatus('error');
      return;
    }

    try {
      const response = await fetch('/api/post/reportuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reason: description, reportedBy: reporterId }),
      });

      if (response.ok) {
        setReportStatus('success'); // Report was successful
      } else {
        const errorMessage = await response.text();
        console.error('Failed to report:', errorMessage);
        setReportStatus('error'); // Failed to report
      }
    } catch (error) {
      console.error('Error reporting post:', error);
      setReportStatus('error'); // Failed to report
    }
  };

  const handleClose = () => {
    setReportStatus(''); // Reset the status for the next use
    setDescription(''); // Clear the description field
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[5px] shadow-lg p-5 relative"
        style={{
          width: '400px',
          height: '300px',
          border: '1px solid black',
          zIndex: 1000,
        }}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-[22px] font-semibold text-black mb-0">Report</h2>
          <button onClick={handleClose} className="focus:outline-none flex items-center">
            <Image src="/svg/eks.svg" alt="Close" width={15} height={15} />
          </button>
        </div>

        <hr
          className="border-t border-black top-20"
          style={{ borderWidth: '.05px', width: 'calc(100%+40px)', margin: '0 -20px' }}
        />

        {/* Modal Content */}
        <div className="mt-4">
          {reportStatus === 'success' ? (
            // Success message
            <div className="text-center mt-20">
              <p className="text-green-500 font-semibold text-[16px] mb-4">Report Successful!</p>
              <button
                onClick={handleClose}
                className="w-full h-[40px] font-semibold rounded transition duration-300 mt-10"
                style={{
                  border: '1px solid #22C55E',
                  color: '#22C55E',
                  backgroundColor: 'white',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.backgroundColor = '#22C55E';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#22C55E';
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Close
              </button>
            </div>
          ) : reportStatus === 'error' ? (
            // Error message
            <div className="text-center mt-20">
              <p className="text-red-500 font-semibold text-[16px] mb-4">Write your reasons first.</p>
              <button
                onClick={() => setReportStatus('')} // Allow retry by clearing the status
                className="w-full h-[40px] font-semibold rounded transition duration-300 mt-10"
                style={{
                  border: '1px solid #DC2626',
                  color: '#DC2626',
                  backgroundColor: 'white',
                }}
              >
                Retry
              </button>
            </div>
          ) : (
            // Default form to submit a report
            <>
              <p className="text-black text-[16px] mb-2">Why are you reporting this user/post?</p>
              <textarea
                className="mt-1 w-full h-[80px] px-3 text-black text-[14px] resize-none focus:outline-none placeholder-gray-500"
                placeholder="Write your reason..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus
              />

              {/* Report Button */}
              <button
                onClick={handleReport}
                className="modal-button w-full h-[40px] font-semibold rounded transition duration-300 mt-4"
                style={{
                  border: '1px solid #22C55E',
                  color: '#22C55E',
                  backgroundColor: 'white',
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'white';
                  e.target.style.backgroundColor = '#22C55E';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#22C55E';
                  e.target.style.backgroundColor = 'white';
                }}
              >
                Report
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
