import Image from 'next/image';

export default function NotificationSidebar() {
  return (
    <div className="right-[16rem] flex flex-col space-y-5 fixed z-40 top-8">
      <div
        className="mt-14 bg-white p-4 rounded-[15px] shadow-lg"
        style={{
          width: '316px',
          height: '200px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2), inset 0 2px 6px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-semibold text-[18px] text-black">Activity</h2>
          <button className="text-[#28B446] text-[15px]">See all</button>
        </div>
        <hr className="border-t border-black w-full mb-3" style={{ height: '1px' }} />
        <ul className="space-y-2 text-black">
          <li className="flex items-center">
            <Image
              src="/images/user.png"
              alt="Notification"
              width={32}
              height={32}
              className="rounded-full mr-2"
            />
            <span className="text-[16px]">
              <strong>Sam</strong> started following you.
            </span>
          </li>
          <li className="flex items-center">
            <Image
              src="/images/user.png"
              alt="Notification"
              width={32}
              height={32}
              className="rounded-full mr-2"
            />
            <span className="text-[16px]">
              <strong>Alex</strong> liked your post.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
