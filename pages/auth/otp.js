import { Chakra_Petch } from "next/font/google";
import { useRouter } from 'next/router';  // Import useRouter from Next.js
import routes from '../../routes';  // Import the centralized routes
import Button from "../../components/ui/button";
import Image from 'next/image';

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "700"],  // Light, Regular, Bold
});

export default function OTP() {
  const router = useRouter(); // Initialize the router

  // Navigate to Log In page
  const navigateToLogin = () => {
    router.push(routes.auth.login);  // Using routes.js for navigation
  };

  return (
    <div className={`flex min-h-screen items-center justify-center bg-gray-100 bg-cover bg-center ${chakraPetch.className}`}
      style={{ backgroundImage: "url('/images/image.jpg')", position: "fixed", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl">
        
        {/* Left Section: OTP Verification Form */}
        <div className="p-8 md:w-96">
          <h2 className="text-2xl font-bold text-green-600 mb-4 cursor-pointer" onClick={navigateToLogin}>Protecture</h2>

          <div className="w-full h-px bg-gray-300 my-4"></div>

          {/* OTP Message */}
          <h3 className="text-lg font-semibold text-center mb-2 text-black">Code Verification</h3>
          <p className="text-sm text-center text-gray-500 mb-4">
            We&apos;ve sent an OTP verification on your Google account.
          </p>

          {/* OTP Input Fields */}
          <div className="flex justify-center mb-4 space-x-2">
            {[...Array(6)].map((_, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-black text-2xl"
              />
            ))}
          </div>

          {/* Verify Button */}
          <div className="mt-40 mb-2">
            <Button 
              className="w-full bg-green-500 text-white font-bold py-2 rounded-md hover:bg-green-600"
              style={{ borderWidth: '1px', borderRadius: '8px' }}  // Smaller border and rounded format
            >
              Verify
            </Button>
          </div>

          {/* Resend Link */}
          <p className="text-center text-sm text-green-600 mt-1 cursor-pointer">Resend</p>
        </div>

        {/* Right Section: Join the Community */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 text-white md:w-96 relative flex flex-col justify-center items-center min-h-[500px]">
          <h2 className="text-2xl font-bold mb-4 mt-[-30px] text-center">Join the Community</h2>
          <ul className="space-y-4">
            <li className="flex items-center space-x-2">
              <Image src="/svg/community_login.svg" alt="Community Icon" width={24} height={24} />
              <p className="font-light">Share it with other architects</p>
            </li>
            <li className="flex items-center space-x-2">
              <Image src="/svg/post_login.svg" alt="Post Icon" width={24} height={24} />
              <p className="font-light">Feel free to post your work</p>
            </li>
            <li className="flex items-center space-x-2">
              <Image src="/svg/handshake_login.svg" alt="Handshake Icon" width={24} height={24} />
              <p className="font-light">Find and build a healthy community</p>
            </li>
            <li className="flex items-center space-x-2">
              <Image src="/svg/security_login.svg" alt="Security Icon" width={24} height={24} />
              <p className="font-light">Protection against AI exploitation</p>
            </li>
            <li className="flex items-center space-x-2">
              <Image src="/svg/archi_login.svg" alt="Architecture Icon" width={24} height={24} />
              <p className="font-light">A web dedicated to Architecture</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
