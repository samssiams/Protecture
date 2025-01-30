// components/communities.js

import { useState, useEffect } from 'react';
import Image from 'next/image';
import axios from 'axios';
import Skeleton from '@/components/ui/skeleton';
import Link from 'next/link';
import routes from '@/routes';

export default function Communities({ openCreateCommunityModal }) {
  const [communities, setCommunities] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch the limited list of APPROVED communities
  // and check if the user is a member of them
  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/community/get-community');
      if (response.status === 200) {
        setCommunities(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch communities.');
      console.error('Failed to fetch communities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunities();
  }, []);

  return (
    <div
      className="fixed bg-white p-4 rounded-[15px] shadow-lg right-[16rem] bottom-[19.7rem]"
      style={{
        width: '316px',
        height: '288px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
      }}
    >
      <div className="flex justify-between items-center">
        <h2 className="font-semibold text-[18px] text-black">Communities</h2>
        <button
          className="text-[#22C55E] text-[15px]"
          onClick={openCreateCommunityModal}
        >
          See all
        </button>
      </div>
      <hr
        className="border-t border-black w-full mb-3 mt-2"
        style={{ height: '1px' }}
      />

      {/* Create community shortcut */}
      <div
        className="flex items-center mb-3 hover:bg-[#D9D9D9] rounded-md px-3 py-1 transition-colors duration-200 cursor-pointer"
        style={{ width: '100%' }}
        onClick={openCreateCommunityModal}
      >
        <Image
          src="/svg/add.svg"
          alt="Add Community"
          width={14}
          height={14}
          className="mr-2"
          style={{ marginLeft: '-5px' }}
        />
        <span className="text-black text-[17px] font-light">
          Create a community
        </span>
      </div>

      {loading ? (
        // Show skeleton loaders while fetching
        <div className="space-y-2">
          {[...Array(5)].map((_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-2 py-1"
            >
              <Skeleton width="60px" height="10px" borderRadius="6px" />
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <ul className="space-y-2 text-black">
          {communities.length === 0 ? (
            <li className="px-3 py-1 text-gray-500 italic">
              No communities found.
            </li>
          ) : (
            communities.map((community) => (
              <li
                key={community.id}
                className="flex items-center justify-between hover:bg-[#D9D9D9] rounded-md px-3 py-1 transition-colors duration-200"
                style={{ width: '100%' }}
              >
                <Link href={routes.community.home.replace('[id]', community.id)} className="text-[16px] font-semibold">
                  p/{community.name}
                </Link>
                {community.joined ? (
                  <button
                    className="bg-[#22C55E] text-white font-semibold text-[13px] px-3 py-1 rounded-[6px]"
                    style={{
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    }}
                  >
                    Joined
                  </button>
                ) : (
                  <button
                    className="border border-[#22C55E] text-[#22C55E] font-semibold text-[13px] px-3 py-1 rounded-[6px] hover:bg-[#22C55E] hover:text-white transition-colors duration-200"
                  >
                    Join
                  </button>
                )}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
