import { useState } from 'react';
import { Chakra_Petch } from "next/font/google";
import { useRouter } from 'next/router';  // Import useRouter from Next.js
import routes from '../../routes';  // Import the centralized routes
import Button from "../../components/ui/button";
import Image from 'next/image';
import { signIn } from "next-auth/react"; // Import signIn from next-auth for credentials provider

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "700"],  // Light, Regular, Bold
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navigate to SignUp page
  const navigateToSignUp = () => {
    router.push(routes.auth.signup);
  };

  // Handle Login
  const handleLogin = async () => {
    try {
      const response = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (response?.error) {
        setErrorMessage('Invalid username or password. Please try again.');
        setIsModalOpen(true);
      } else {
        router.push(routes.pages.home);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setErrorMessage('An error occurred while trying to log in. Please try again.');
      setIsModalOpen(true);
    }
  };

  // Close modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className={`flex min-h-screen items-center justify-center bg-gray-100 bg-cover bg-center ${chakraPetch.className}`}
      style={{ backgroundImage: "url('/images/image.jpg')", position: "fixed", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl">
        
        <div className="p-8 md:w-96">
          <h2 className="text-2xl font-bold text-green-600 mb-4 cursor-pointer">Protecture</h2>

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-light text-black">Already registered?</p>
            <div className="flex items-center space-x-2">
              <p className={`text-sm font-bold text-green-600`}>Log In</p>
              <button type="button" onClick={navigateToSignUp}>
                <Image 
                  src="/svg/signup_switch.svg" 
                  alt="Toggle Sign Up and Log In" 
                  width={24} 
                  height={24} 
                />
              </button>
              <p className="text-sm font-bold text-black">Sign Up</p>
            </div>
          </div>

          <Button className="bg-white text-black border border-gray-300 flex items-center justify-center font-normal w-full hover:bg-white" onClick={() => alert('Google login functionality to be implemented.')}>
            <Image src="/svg/google_login.svg" alt="Google Icon" width={20} height={20} className="mr-2" />
            <span className="text-black text-[18px] font-bold">Continue with Google</span>
          </Button>

          <div className="flex items-center justify-between my-4">
            <div className="w-full h-px bg-gray-300"></div>
            <span className="text-gray-500 px-4">or</span>
            <div className="w-full h-px bg-gray-300"></div>
          </div>

          <div className="mb-4">
            <label className="block text-black text-sm mb-2">Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-black"
            />
          </div>

          <div className="mb-4">
            <label className="block text-black text-sm mb-2">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-black"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                <Image
                  src={showPassword ? "/svg/password_on.svg" : "/svg/password_off.svg"}
                  alt="Toggle Password Visibility"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>

          <Button className="w-full" onClick={handleLogin}>Login</Button>
        </div>

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

      {/* Modal for Error Messages */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center text-black z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg text-[#22C55E] font-semibold text-center">Error</h2>
            <p className="mt-4 text-center">{errorMessage}</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={closeModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}