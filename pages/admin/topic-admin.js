import { useState } from "react";
import ModalTopic from "../../pages/admin/modal-admin/modal-topic";

export default function TopicAdmin() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);

  const handleOpenModal = (topic) => {
    setSelectedTopic(topic);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTopic(null);
    setIsModalOpen(false);
  };

  const handleApprove = () => {
    console.log(`Topic "${selectedTopic.title}" approved.`);
    handleCloseModal();
  };

  const topics = [
    { title: "Modern House", user: "@joexsu", reason: "Inappropriate design" },
    { title: "Cottage House", user: "@joexsu", reason: "Unclear purpose" },
    { title: "Bungalow House", user: "@joexsu", reason: "Community guidelines violation" },
  ];

  return (
    <div
      className="bg-white p-6 rounded-lg"
      style={{
        boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)",
      }}
    >
      <h2 className="text-lg font-bold text-black mb-6">Topics Module</h2>
      <div className="space-y-4">
        {topics.map((topic, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-100 px-4 py-2 rounded-lg"
          >
            <div>
              <h3 className="text-black font-bold">{topic.title}</h3>
              <span className="text-gray-700">{topic.user}</span>
            </div>
            <div>
              <button
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-600 transition"
                onClick={() => handleOpenModal(topic)}
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full bg-[#22C55E] text-white py-2 rounded-lg font-bold hover:bg-green-600 transition">
        View All Topics
      </button>
      <ModalTopic
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onApprove={handleApprove}
        topic={selectedTopic}
      />
    </div>
  );
}
