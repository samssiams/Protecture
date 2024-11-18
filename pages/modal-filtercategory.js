import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const ModalFilterCategory = ({ isOpen, onClose, onCategorySelect }) => {
  if (!isOpen) return null;

  const categories = [
    'Modern',
    'Contemporary',
    'Victorian',
    'Traditional',
    'Bungalow',
  ];

  const handleCategoryClick = (category) => {
    onCategorySelect(category); // Notify parent of selected category
    onClose(); // Close the modal
  };

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
          height: 'auto',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
        }}
      >
        <div className="p-0">
          <div className="flex justify-between items-center px-4 pt-4">
            <h2 className="text-black font-bold text-[18px]">Select Category</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-black">
              <Image src="/svg/eks.svg" alt="Close" width={15} height={15} />
            </button>
          </div>
          <hr className="w-full border-t border-black mx-0 mt-2" />
          <ul className="space-y-2 px-4 py-3">
            {categories.map((category) => (
              <li
                key={category}
                className="cursor-pointer px-4 py-2 rounded hover:bg-[#F2F4F7] transition-colors duration-200 text-black"
                onClick={() => handleCategoryClick(category)}
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
