// modal-reportusers.js
import { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

export default function ReportUserModal({ isOpen, onClose, postId }) {
  const [description, setDescription] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false); // Track if the report was successful

  console.log('Modal isOpen:', isOpen); // Debugging: Check if the modal is open

  if (!isOpen) {
    console.log('Modal is closed, returning null');
    return null;
  }

  const handleReport = async () => {
    try {
      const response = await fetch('/api/post/reportuser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, reason: description }), // Add postId and reason for the report
      });

      if (response.ok) {
        console.log('Reported successfully:', description); // Debugging: Check the report content
        setReportSuccess(true); // Set report success state to true to display the success message
      } else {
        console.error('Failed to report:', await response.text());
      }
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  const handleClose = () => {
    console.log('Closing modal');
    // Close the modal after success message is shown
    if (reportSuccess) {
      setReportSuccess(false); // Reset the success state for the next use
      onClose(); // Close the modal
    }
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
          width: '400px', // Reduced width from 544px to 400px
          height: '300px',
          border: '1px solid black',
          zIndex: 1000, // Ensure modal has a higher z-index to be above other content
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
          style={{ borderWidth: '.05px', width: 'calc(100% + 40px)', margin: '0 -20px' }}
        />

        {/* Modal Content */}
        <div className="mt-4">
          {reportSuccess ? (
            // If report is successful, show success message
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
                  e.target.style.backgroundColor = '#22C55E';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#22C55E';
                }}
              >
                Close
              </button>
            </div>
          ) : (
            // Otherwise show the textarea for entering report details
            <>
              <p className="text-black text-[16px] mb-2">Why are you reporting this user/post?</p>
              <textarea
                className="mt-1 w-full h-[80px] px-3 text-black text-[14px] resize-none focus:outline-none placeholder-gray-500"
                placeholder="Write your reason..."
                style={{ backgroundColor: 'transparent', border: 'none' }}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                autoFocus // Ensure the textarea gets focused automatically when modal is opened
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
                  e.target.style.backgroundColor = '#22C55E';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'white';
                  e.target.style.color = '#22C55E';
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
