// pages/auth/login.js (or wherever your login component is)
import { useState, useEffect } from "react";
import { Chakra_Petch } from "next/font/google";
import { useRouter } from "next/router";
import routes from "../../routes";
import Button from "../../components/ui/button";
import Image from "next/image";
import { signIn, getSession } from "next-auth/react";

const chakraPetch = Chakra_Petch({
  subsets: ["latin"],
  weight: ["300", "400", "700"],
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAppealModalOpen, setIsAppealModalOpen] = useState(false);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [appealMessage, setAppealMessage] = useState("");
  const [isLoginActive, setIsLoginActive] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoginActive(true);
  }, []);

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Navigate to SignUp page
  const navigateToSignUp = () => {
    setIsLoginActive(false);
    router.push(routes.auth.signup);
  };

  // Handle Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setIsModalOpen(false);
    setIsLoading(true);
    try {
      const response = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (response?.ok) {
        const session = await getSession();
        if (session?.user?.role === "admin") {
          router.push(routes.admin.users);
        } else {
          router.push(routes.pages.home);
        }
      } else {
        let errorData;
        try {
          errorData = JSON.parse(response.error);
        } catch {
          errorData = { message: response.error };
        }
        setErrorMessage(
          errorData.message || "Invalid username or password. Please try again."
        );
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setErrorMessage("An error occurred while trying to log in. Please try again.");
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Signup/Login
  const handleGoogleAuth = async () => {
    try {
      const response = await signIn("google", {
        callbackUrl: `${window.location.origin}${routes.pages.home}`,
      });
      if (response?.url) {
        router.push(response.url);
      } else {
        setErrorMessage("Google authentication failed. Please try again.");
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Google authentication failed:", error);
      setErrorMessage("An error occurred during Google authentication. Please try again.");
      setIsModalOpen(true);
    }
  };

  // Close error modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Open appeal modal (close error modal first)
  const openAppealModal = () => {
    setIsModalOpen(false);
    setIsAppealModalOpen(true);
  };

  // Handle appeal submission: call the API and show confirmation on success
  const handleAppealSubmit = async () => {
    try {
      const response = await fetch("/api/admin/admin-appeal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, msg: appealMessage }),
      });
      if (response.ok) {
        setIsAppealModalOpen(false);
        setAppealMessage("");
        setIsConfirmationModalOpen(true);
      } else {
        console.error("Failed to submit appeal");
      }
    } catch (error) {
      console.error("Error submitting appeal", error);
    }
  };

  // Cancel the appeal
  const handleAppealCancel = () => {
    setIsAppealModalOpen(false);
    setAppealMessage("");
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
          <h2 className="text-2xl font-bold text-green-600 mb-4 cursor-pointer">
            Protecture
          </h2>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm font-light text-black">Already registered?</p>
            <div className="flex items-center space-x-2">
              <p className={`text-sm font-bold ${isLoginActive ? "text-green-600" : "text-black"}`}>
                Log In
              </p>
              <button type="button" onClick={navigateToSignUp}>
                <Image src="/svg/signup_switch.svg" alt="Toggle Sign Up and Log In" width={24} height={24} />
              </button>
              <p className={`text-sm font-bold ${!isLoginActive ? "text-green-600" : "text-black"}`}>
                Sign Up
              </p>
            </div>
          </div>

          {/* Google Authentication Button */}
          <Button
            className="bg-white text-black border border-gray-300 flex items-center justify-center font-normal w-full hover:bg-white mb-4"
            onClick={handleGoogleAuth}
          >
            <Image src="/svg/google_login.svg" alt="Google Icon" width={20} height={20} className="mr-2" />
            <span className="text-black text-[18px] font-bold">Continue with Google</span>
          </Button>

          <div className="flex items-center justify-between my-4">
            <div className="w-full h-px bg-gray-300"></div>
            <span className="text-gray-500 px-4">or</span>
            <div className="w-full h-px bg-gray-300"></div>
          </div>

          {/* Regular Login Form */}
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-black text-sm mb-2">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black placeholder-black"
                required
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
                  required
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
            <Button
              type="submit"
              className={`w-full flex items-center justify-center ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-3 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    ></path>
                  </svg>
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>

        {/* Right Section */}
        <div className="bg-gradient-to-r from-green-400 to-blue-500 p-8 text-white md:w-96 relative flex flex-col justify-center items-center min-h-[500px]">
          <h2 className="text-2xl font-bold mb-4 mt-[-30px] text-center">
            Join the Community
          </h2>
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

      {/* Error Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center text-black z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg font-semibold text-center text-red-500">
              {errorMessage.toLowerCase().includes("suspended")
                ? "Account Suspended"
                : "Invalid Account"}
            </h2>
            <p className="mt-4 text-center">{errorMessage}</p>
            <div className="mt-6 flex justify-center">
              {errorMessage.toLowerCase().includes("suspended") ? (
                <Button onClick={openAppealModal}>Appeal</Button>
              ) : (
                <Button onClick={closeModal}>Close</Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Appeal Modal */}
      {isAppealModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center text-black z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg text-[#22C55E] font-semibold text-center">Message us</h2>
            <textarea
              value={appealMessage}
              onChange={(e) => setAppealMessage(e.target.value)}
              placeholder="Type your appeal message here..."
              className="w-full h-24 mt-4 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            />
            <div className="mt-6 flex justify-center space-x-20">
              <button
                onClick={handleAppealSubmit}
                className="bg-green-500 text-white px-4 py-2 rounded-md font-bold hover:bg-green-600"
              >
                Submit
              </button>
              <button
                onClick={handleAppealCancel}
                className="bg-red-500 text-white px-4 py-2 rounded-md font-bold hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {isConfirmationModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center text-black z-50 bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h2 className="text-lg text-[#22C55E] font-semibold text-center">
              Appeal Received
            </h2>
            <p className="mt-4 text-center">
              Your appeal has been received. We will review it. Thank you!
            </p>
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setIsConfirmationModalOpen(false)}
                className="bg-green-500 text-white px-4 py-2 rounded-md font-bold hover:bg-green-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
