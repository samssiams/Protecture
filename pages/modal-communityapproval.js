import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ApprovalCommunityModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[5px] shadow-lg p-5 relative"
        style={{
          width: '467px',
          height: '254px',
          border: '1px solid black',
        }}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-1">
          <h2 className="text-[22px] font-semibold text-black mb-0 -mt-3">Admin Approval</h2>
          <button onClick={onClose} className="focus:outline-none flex items-center mb-3">
            <Image src="/svg/eks.svg" alt="Close" width={15} height={15} />
          </button>
        </div>

        {/* Full width line */}
        <hr
          className="border-t border-black"
          style={{ borderWidth: '.05px', width: 'calc(100% + 40px)', margin: '0 -20px' }}
        />

        {/* Modal Content */}
        <div className="text-center mt-10">
          <p className="text-[18px] font-regular text-black">
            Your community will be approved once the admin accepts it. We'll notify you when it's ready!
          </p>

          {/* Accept Button */}
          <button
            onClick={onClose} // This will now close both modals when clicked
            className="mt-[2rem] w-full h-[40px] font-semibold rounded transition duration-300"
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
            Accept
          </button>
        </div>
      </motion.div>
    </div>
  );
}
