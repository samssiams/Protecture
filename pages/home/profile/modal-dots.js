// pages/home/profile/modal-dots.js

import Image from 'next/image';
import { motion } from 'framer-motion';

export default function DotsMenu({ isOpen, onClose, position = { left: 0, top: 0 } }) {
  if (!isOpen) return null;

  return (
    <motion.div
      className="absolute bg-white rounded-[5px] border border-black shadow-lg"
      style={{
        width: '145px',
        height: '92px',
        left: position.left - 160, // Adjust to move slightly to the left
        top: position.top,
        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.15), inset 0 2px 6px rgba(0, 0, 0, 0.1)',
        filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
        borderWidth: '1px',
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex flex-col p-3 space-y-1">
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
          onClick={onClose}
        >
          <Image src="/svg/reportuser.svg" alt="Report" width={13} height={13} />
          <span className="text-red-500 font-medium" style={{ fontSize: '12px' }}>
            Report User
          </span>
        </button>
      </div>
    </motion.div>
  );
}