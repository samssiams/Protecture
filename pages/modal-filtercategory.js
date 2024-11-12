// modal-filtercategory.js
import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const ModalFilterCategory = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50"
    >
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[5px] shadow-lg border border-black"
        style={{
          width: '431px',
          height: '277px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
        }}
      >
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-black font-bold text-[18px]">Select Category</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black">
              <Image src="/svg/eks.svg" alt="Close" width={15} height={15} />
            </button>
          </div>
          <hr className="border-t border-black mb-4" />
          <ul className="space-y-2">
            {['Bungalow', 'Modern', 'Cottage', 'Minimalist'].map((category) => (
              <li
                key={category}
                className="cursor-pointer px-4 py-2 rounded hover:bg-[#F2F4F7] transition-colors duration-200 text-black"
              >
                {category}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </div>
  );
};

export default ModalFilterCategory;
