import React from 'react';
import Image from 'next/image';

export default function Communities({ openCreateCommunityModal }) {
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
      <ul className="space-y-2 text-black">
        <li
          className="flex items-center justify-between hover:bg-[#D9D9D9] rounded-md px-3 py-1 transition-colors duration-200"
          style={{ width: '100%' }}
        >
          <span className="text-[16px] font-semibold">p/Cottage</span>
          <button
            className="bg-[#22C55E] text-white font-semibold text-[13px] px-3 py-1 rounded-[6px]"
            style={{
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            }}
          >
            Enter
          </button>
        </li>
        <li
          className="flex items-center justify-between hover:bg-[#D9D9D9] rounded-md px-3 py-1 transition-colors duration-200"
          style={{ width: '100%' }}
        >
          <span className="text-[16px] font-semibold">p/Bungalow</span>
          <button
            className="border border-[#22C55E] text-[#22C55E] font-semibold text-[13px] px-3 py-1 rounded-[6px] hover:bg-[#22C55E] hover:text-white transition-colors duration-200"
          >
            Join
          </button>
        </li>
      </ul>
    </div>
  );
}