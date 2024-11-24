import { useState } from "react";
import { Chakra_Petch } from "next/font/google";
import { useRouter } from "next/router";
import Button from "../../components/ui/button";
import Image from "next/image";
import axios from "axios";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export default function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
  const router = useRouter();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const navigateToLogin = () => {
    router.push("/auth/login");
  };

  // Handle Regular Signup - Generate OTP
  const handleRegularSignup = async () => {
    if (!username.trim() || !name.trim() || !email.trim() || !password.trim()) {
      setErrorMessage("All fields are required.");
      setIsErrorModalOpen(true);
      return;
    }

    console.log("Sending signup data for OTP generation:", { username, name, email, password });

    try {
      const response = await axios.post("/api/auth/register", {
        username,
        name,
        email,
        password,
      });

      if (response.status === 200) {
        console.log("OTP generated successfully:", response.data);
        setIsOtpModalOpen(true); // Show OTP modal
      }
    } catch (error) {
      console.error("Error during signup:", error.response?.data || error.message);
      setErrorMessage(
        error.response?.data?.error || "Error during signup. Please try again."
      );
      setIsErrorModalOpen(true);
    }
  };

  // Verify OTP and Complete Signup
  const verifyOtp = async () => {
    if (!otp.trim()) {
      setErrorMessage("OTP is required.");
      setIsErrorModalOpen(true);
      return;
    }

    console.log("Sending OTP verification request:", { email, otp, username, name, password });

    try {
      const response = await axios.post("/api/auth/verify", {
        email,
        otp,
        username,
        name,
        password,
      });

      if (response.status === 201) {
        console.log("OTP verified successfully. User created:", response.data);
        setIsSuccessModalOpen(true);
        setTimeout(() => {
          navigateToLogin();
        }, 2000);
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      console.error("Error verifying OTP:", error.response?.data || error.message);
      setErrorMessage("Error verifying OTP. Please try again.");
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
    <div
      className={`flex min-h-screen items-center justify-center bg-gray-100 bg-cover bg-center ${chakraPetch.className}`}
      style={{
        backgroundImage: "url('/images/image.jpg')",
        position: "fixed",
        width: "100%",
        height: "100%",
        overflow: "hidden",
      }}
    >
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden max-w-3xl">
        <div className="p-8 md:w-96">
          <h2
            className="text-2xl font-bold text-green-600 mb-4 cursor-pointer"
            onClick={navigateToLogin}
          >
            Protecture
          </h2>
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
                  src={
                    showPassword ? "/svg/password_on.svg" : "/svg/password_off.svg"
                  }
                  alt="Toggle Password Visibility"
                  width={24}
                  height={24}
                />
              </button>
            </div>
          </div>
          <Button className="w-full" onClick={handleRegularSignup}>
            Sign Up
          </Button>
        </div>

        {/* Right Section */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 text-white md:w-96 relative flex flex-col justify-center items-center min-h-[500px]">
          <h2 className="text-2xl font-bold mb-4 mt-[-30px] text-center">
            Join the Community
          </h2>
          <ul className="space-y-4">
            <li className="flex items-center space-x-2">
              <Image
                src="/svg/community_login.svg"
                alt="Community Icon"
                width={24}
                height={24}
              />
              <p className="font-light">Share it with other architects</p>
            </li>
            <li className="flex items-center space-x-2">
              <Image
                src="/svg/post_login.svg"
                alt="Post Icon"
                width={24}
                height={24}
              />
              <p className="font-light">Feel free to post your work</p>
            </li>
            <li className="flex items-center space-x-2">
              <Image
                src="/svg/handshake_login.svg"
                alt="Handshake Icon"
                width={24}
                height={24}
              />
              <p className="font-light">Find and build a healthy community</p>
            </li>
            <li className="flex items-center space-x-2">
              <Image
                src="/svg/security_login.svg"
                alt="Security Icon"
                width={24}
                height={24}
              />
              <p className="font-light">Protection against AI exploitation</p>
            </li>
            <li className="flex items-center space-x-2">
              <Image
                src="/svg/archi_login.svg"
                alt="Architecture Icon"
                width={24}
                height={24}
              />
              <p className="font-light">A web dedicated to Architecture</p>
            </li>
          </ul>
        </div>
      </div>

      {/* OTP Modal */}
      {isOtpModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 text-black bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg text-green-600 font-semibold text-center">
              Enter OTP
            </h2>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none text-black placeholder-black mt-4"
            />
            <div className="mt-6 flex justify-center">
              <Button onClick={verifyOtp}>Verify</Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 text-black bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg text-red-600 font-semibold text-center">
              Error
            </h2>
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
            <h2 className="text-lg text-green-600 font-semibold text-center">
              Sign-up Complete!
            </h2>
            <p className="mt-4 text-center">
              Your account has been created successfully. Redirecting to login...
            </p>
            <div className="mt-6 flex justify-center">
              <Button onClick={closeSuccessModal}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
