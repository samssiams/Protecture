import React, { useState } from 'react';
import { useRouter } from 'next/router';

const LoginAdmin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsModalVisible(false);

    try {
      // Attempt to log in
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();

        if (response.ok) {
          router.push(data.redirectTo); // Navigate to the admin page
        } else if (response.status === 403) {
          setIsModalVisible(true); // Show modal for non-admin users
        } else {
          setError(data.message || 'Login failed');
        }
      } else {
        // Handle unexpected non-JSON responses
        const text = await response.text();
        setError(text || 'An unexpected error occurred');
      }
    } catch (error) {
      console.error('Error during login request:', error);
      setError('An error occurred. Please try again.');
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
            />
          </div>
          {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            className="w-full py-2 text-white bg-green-600 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:outline-none"
          >
            Login
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
