// pages/modal-members.js

import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ModalMembers({ isOpen, onClose, members }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-[5px] shadow-lg p-4 relative"
        style={{
          position: 'fixed',
          top: '10%',      // adjust as needed
          right: '90px',   // adjust as needed
          width: '150px',   // reduced width
          maxHeight: '80vh',
          overflowY: 'auto',
          border: '1px solid black',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-center items-center mb-2">
          <h2 className="text-[18px] font-semibold text-black text-center">
            Members
          </h2>
        </div>

        {/* Horizontal Line */}
        <hr
          className="border-t border-black my-2"
          style={{ width: '100%' }}
        />

        {/* Modal Content */}
        <div className="mt-2">
          {members && members.length > 0 ? (
            members.map((member) => (
              <div
                key={member.id}
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <span className="text-xs text-gray-700 block text-center">
                  {member.user.name || member.user.username}
                </span>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-600 text-xs">No members found.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
