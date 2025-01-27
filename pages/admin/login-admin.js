// components/LoginAdmin.js

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/router';

const LoginAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // New state for loading
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsModalVisible(false);
    setIsLoading(true); // Start loading

    try {
      const result = await signIn('credentials', {
        redirect: false, // Prevent automatic redirection
        username,
        password,
      });

      if (result.error) {
        if (result.error === 'You are not an admin') {
          setIsModalVisible(true);
        } else {
          setError(result.error || 'Login failed');
        }
      } else {
        // After successful sign-in, fetch the session to get user role
        const sessionRes = await fetch('/api/auth/session');
        const session = await sessionRes.json();

        if (session?.user?.role === 'admin') {
          router.push('/admin/users-admin');
        } else {
          router.push('/'); // Fallback to home if not admin
        }
      }
    } catch (err) {
      console.error('Error during login request:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/images/image.jpg')" }}
    >
      <div className="bg-white shadow-md rounded-lg p-8 max-w-sm w-full">
        <h2 className="text-2xl font-semibold text-center text-green-600 mb-6">Admin Login</h2>
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:ring-green-500 focus:border-green-500 border-gray-300"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-3 py-2 mt-1 border rounded-md text-black focus:ring-green-500 focus:border-green-500 border-gray-300"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className={`w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none flex items-center justify-center ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading && (
              <svg
                className="animate-spin h-5 w-5 mr-3 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
            )}
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Modal for Non-Admin Users */}
      {isModalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold text-red-600 mb-4">Access Denied</h3>
            <p className="text-gray-700">You are not an admin.</p>
            <button
              onClick={() => setIsModalVisible(false)}
              className="mt-4 py-2 px-4 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginAdmin;
