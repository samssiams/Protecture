import { useState } from 'react';
import { Chakra_Petch } from "next/font/google";
import { useRouter } from 'next/router';
import routes from '../../routes';
import Button from "../../components/ui/button";
import Image from 'next/image';
import axios from 'axios';

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateToLogin = () => {
    router.push(routes.auth.login);
  };

  const handleGoogleSignup = async () => {
    try {
      const response = await axios.post(routes.api.googleLogin);
      if (response.status === 200) {
        router.push(routes.auth.otp);
      }
    } catch (error) {
      console.error('Google signup error:', error);
      setErrorMessage('Error signing up with Google. Please try again.');
      setIsErrorModalOpen(true);
    }
  };

  const handleRegularSignup = async () => {
    if (!username || !name || !email || !password) {
      setErrorMessage('Please fill in all fields before signing up.');
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const response = await axios.post(routes.api.authSignup, {
        username,
        name,
        email,
        password,
      });
      if (response.status === 201) {
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          navigateToLogin();
        }, 2000);
      }
    } catch (error) {
      console.error('Error signing up:', error);
      setErrorMessage('Error signing up. Please try again.');
      setIsErrorModalOpen(true);
    }
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
  };

  return (
    <div className={`flex min-h-screen items-center justify-center bg-gray-100 bg-cover bg-center ${chakraPetch.className}`}
      style={{ backgroundImage: "url('/images/image.jpg')", position: "fixed", width: "100%", height: "100%", overflow: "hidden" }}
    >
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl">
        
        <div className="p-8 md:w-96">
          <h2 className="text-2xl font-bold text-green-600 mb-4 cursor-pointer" onClick={navigateToLogin}>Protecture</h2>

          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-light text-black">Already registered?</p>
            <div className="flex items-center space-x-2">
              <p className="text-sm font-bold text-black">Log In</p>
              <button type="button" onClick={navigateToLogin}>
                <Image 
                  src="/svg/login_switch.svg" 
                  alt="Toggle Sign Up and Log In" 
                  width={24} 
                  height={24} 
                />
              </button>
              <p className="text-sm font-bold text-green-600">Sign Up</p>
            </div>
          </div>

          {/* Google Sign Up Button */}
          <Button className="bg-white text-black border border-gray-300 flex items-center justify-center font-normal w-full hover:bg-white" onClick={handleGoogleSignup}>
            <Image src="/svg/google_login.svg" alt="Google Icon" width={20} height={20} className="mr-2" />
            <span className="text-black text-[18px] font-bold">Continue with Google</span>
          </Button>

          <div className="flex items-center justify-between my-4">
            <div className="w-full h-px bg-gray-300"></div>
            <span className="text-gray-500 px-4">or</span>
            <div className="w-full h-px bg-gray-300"></div>
          </div>

          {/* Regular Sign Up Form */}
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
            <label className="block text-black text-sm mb-2">Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-black"
            />
          </div>

          <div className="mb-4">
            <label className="block text-black text-sm mb-2">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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

          {/* Regular Sign Up Button */}
          <Button className="w-full" onClick={handleRegularSignup}>Sign Up</Button>
        </div>

        {/* Right Section */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 text-white md:w-96 relative flex flex-col justify-center items-center min-h-[500px]">
          <h2 className="text-2xl font-bold mb-4 mt-[-30px] text-center">Join the Community</h2>
          <ul className="space-y-4">
            {/* Additional feature points */}
          </ul>
        </div>
      </div>

      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 text-black bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg text-red-600 font-semibold text-center">Error</h2>
            <p className="mt-4 text-center">{errorMessage}</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={closeErrorModal}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 text-black bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg text-green-600 font-semibold text-center">Sign-up Complete!</h2>
            <p className="mt-4 text-center">Your account has been created successfully. Redirecting to login...</p>
            <div className="mt-6 flex justify-center">
              <Button onClick={closeSuccessModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
