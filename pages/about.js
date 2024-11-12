import Navbar from '../components/ui/navbar'; // Import the Navbar component
import Image from 'next/image'; // Import Image component

export default function About() {
  return (
    <div className="bg-[#F0FDF4] min-h-screen">
      {/* Add the Navbar */}
      <Navbar />

      {/* Main content container */}
      <div className="pt-[40px] flex flex-col items-center justify-center min-h-screen px-4">
        <div
          className="bg-white rounded-lg p-10 max-w-5xl w-full shadow-lg"
          style={{
            boxShadow: `0 10px 20px rgba(0, 0, 0, 0.15), inset 0 2px 6px rgba(0, 0, 0, 0.1)`,
            borderRadius: '12px',
          }}
        >
          {/* Main Heading */}
          <h1 className="text-4xl font-bold text-green-600 text-center mb-4">Protecture</h1>
          <p className="text-center text-black mb-10">
            Protected Integration for Creative Architecture Design aims to protect architectural designs from artificial intelligence exploitation.
          </p>

          {/* Feature Cards */}
          <div className="flex justify-center space-x-8 mb-12">
            {/* Vision Card */}
            <div
              className="bg-white border rounded-lg p-6 text-center shadow-md transition-transform duration-200 hover:scale-105"
              style={{
                width: '250px',
                boxShadow: 'inset 0px 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2 className="text-xl font-bold text-green-600 mt-4">Vision</h2>
              <p className="text-black mt-2 text-sm">
                To become a known platform for protecting architectural design and concepts, ensuring that the works of students and designers are secure, and resilient to artificial intelligence exploitation.
              </p>
            </div>

            {/* Mission Card */}
            <div
              className="bg-white border rounded-lg p-6 text-center shadow-md transition-transform duration-200 hover:scale-105"
              style={{
                width: '250px',
                boxShadow: 'inset 0px 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2 className="text-xl font-bold text-green-600 mt-4">Mission</h2>
              <p className="text-black mt-2 text-sm">
                To provide architectural students and professionals with advanced digital protection technologies that protect their designs and concepts.
              </p>
            </div>

            {/* Features Card */}
            <div
              className="bg-white border rounded-lg p-6 text-center shadow-md transition-transform duration-200 hover:scale-105"
              style={{
                width: '250px',
                boxShadow: 'inset 0px 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h2 className="text-xl font-bold text-green-600 mt-4">Features</h2>
              <p className="text-black mt-2 text-sm">
                PROTECTURE provides a secure space for architecture students and professionals to upload, view, and share designs while ensuring their creative work remains protected.
              </p>
            </div>
          </div>

          {/* Our Team Section */}
          <h2 className="text-2xl font-bold text-center text-green-600 mb-10">Our Team</h2>
          <div className="flex justify-center space-x-12">
            {/* Team Members */}
            {[
              { name: 'Samuel Cruz', img: '/images/sam.png', title: 'ND4A' },
              { name: 'Lyka Marie Arcebido', img: '/images/lyka.png', title: 'ND4A' },
              { name: 'Maryjoe Colubio', img: '/images/joe.png', title: 'ND4A' },
              { name: 'Christian Jake Ebreo', img: '/images/jake.png', title: 'ND4A' },
            ].map((member, index) => (
              <div key={index} className="flex flex-col items-center animate-popup">
                <div className="w-24 h-24 bg-green-200 rounded-full flex items-center justify-center shadow-lg transition-transform transform hover:scale-110">
                  <Image
                    src={member.img}
                    alt={member.name}
                    width={123}
                    height={122}
                    className="rounded-full shadow-md"
                    style={{ boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)' }}
                  />
                </div>
                <p className="mt-4 text-sm font-bold text-black">{member.name}</p>
                <p className="text-sm text-black">{member.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Popup animation for team member images */
        @keyframes popup {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        /* Apply animation when the component loads */
        .animate-popup {
          animation: popup 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
