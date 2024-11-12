// pages/home/profile/modal-following.js

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import DotsMenu from './modal-dots';

export default function FollowingModal({ isOpen, onClose, following }) {
  const [dotsMenuOpen, setDotsMenuOpen] = useState(false);
  const [dotsPosition, setDotsPosition] = useState({ left: 0, top: 0 });
  const dotsMenuRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const toggleDotsMenu = (event) => {
    const buttonRect = event.currentTarget.getBoundingClientRect();
    const modalRect = modalRef.current.getBoundingClientRect();

    // Position the DotsMenu relative to the modal
    setDotsPosition({
      left: buttonRect.left - modalRect.left - 1, // Adjust for closer alignment with the button
      top: buttonRect.top - modalRect.top + buttonRect.height - 16, // Slightly below the button
    });

    setDotsMenuOpen((prev) => !prev);
  };

  const handleClickOutside = (event) => {
    if (dotsMenuRef.current && !dotsMenuRef.current.contains(event.target)) {
      setDotsMenuOpen(false);
    }
  };

  useEffect(() => {
    if (dotsMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dotsMenuOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        ref={modalRef}
        className="bg-white rounded-[10px] shadow-lg p-4 w-[300px] border border-black"
        style={{
          position: 'absolute',
          left: '530px',
          top: '400px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
          filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2))',
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-[18px] font-bold text-black">Following</h2>
          <button onClick={onClose} className="focus:outline-none">
            <Image
              src="/svg/eks.svg"
              alt="Close"
              width={15}
              height={15}
              className="hover:opacity-70"
              style={{ stroke: '#000000', strokeWidth: 10 }}
            />
          </button>
        </div>
        <hr className="border-t border-black mb-4" />

        {/* Following List */}
        <ul className="space-y-3">
          {following.map((user, index) => (
            <li
              key={index}
              className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-[#F2F4F7] transition-colors duration-200"
            >
              <div className="flex items-center space-x-3">
                <Image
                  src={user.image}
                  alt="Following"
                  width={40}
                  height={40}
                  className="rounded-full"
                />
                <span className="font-semibold text-black">{user.name}</span>
              </div>
              <button onClick={toggleDotsMenu} className="focus:outline-none">
                <Image
                  src="/svg/dots.svg"
                  alt="Options"
                  width={4}
                  height={16}
                  style={{ stroke: '#000000', strokeWidth: 10 }}
                />
              </button>
            </li>
          ))}
        </ul>

        {/* Dots Menu */}
        {dotsMenuOpen && (
          <div
            ref={dotsMenuRef}
            style={{
              position: 'absolute',
              left: dotsPosition.left,
              top: dotsPosition.top,
              zIndex: 10,
            }}
          >
            <DotsMenu isOpen={dotsMenuOpen} onClose={() => setDotsMenuOpen(false)} />
          </div>
        )}
      </motion.div>
    </div>
  );
}
