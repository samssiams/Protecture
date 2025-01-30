import { useState, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';

export default function NotificationSidebar({ refreshTrigger }) {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get('/api/sidebar/activity');
        setNotifications(response.data || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, [refreshTrigger]); // Re-fetch notifications whenever refreshTrigger changes

  return (
    <div className="right-[16rem] flex flex-col space-y-5 fixed z-40 top-8">
      <div
        className="mt-14 bg-white p-4 rounded-[15px] shadow-lg custom-scrollbar"
        style={{
          width: '316px',
          maxHeight: '200px',
          overflowY: 'auto',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
          border: '1px solid #E0E0E0',
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-[18px] text-black">Notifications</h2>
        </div>
        <hr className="border-t border-black w-full mb-3" />
        <ul className="space-y-2">
          {notifications.length > 0 ? (
            notifications.map((notif) => {
              const message = notif.message.replace(/^.*?reported/, 'You reported');

              return (
                <li key={notif.id} className="flex items-center">
                  <Image
                    src={notif.actionUser?.profile?.profile_img || '/images/default-profile.png'}
                    alt="Notification Icon"
                    width={32}
                    height={32}
                    className="rounded-full mr-2"
                  />
                  <span className="text-[16px] text-black">
                    <strong>You</strong> {message.replace(/^You/, '').trim()}
                  </span>
                </li>
              );
            })
          ) : (
            <p className="text-center text-gray-500">No notifications available.</p>
          )}
        </ul>
      </div>
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #555;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0;
        }
      `}</style>
    </div>
  );
}
