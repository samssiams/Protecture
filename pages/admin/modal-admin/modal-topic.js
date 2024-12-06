import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ModalTopic({ isOpen, onClose, onReject, onApprove, topic }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        className="bg-white rounded-lg p-6 w-[400px] relative"
        style={{
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
        }}
        initial={{ scale: 0.8 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.8 }}
        transition={{ duration: 0.2 }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-black">Community</h2>
          <button onClick={onClose}>
            <Image src="/svg/eks.svg" alt="Close" width={16} height={16} />
          </button>
        </div>

        {/* Divider Line */}
        <div className="mt-2 absolute top-[56px] left-0 right-0 h-[1px] bg-gray-300"></div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-black font-semibold mb-3 mt-6">{topic.title}</p>
          <p className="text-gray-600 text-sm">{topic.reason || "Reason..."}</p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={onReject}
            className="bg-red-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-red-600 transition"
          >
            Reject
          </button>
          <button
            onClick={onApprove}
            className="bg-green-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-600 transition"
          >
            Approve
          </button>
        </div>
      </motion.div>
    </div>
  );
}
