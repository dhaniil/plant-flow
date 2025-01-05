import React, { useState } from "react";
import { useAdmin } from "../../context/AdminContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { LogOut } from "lucide-react";

const AdminLogin: React.FC = () => {
  const { isAdmin, setAdmin, logout } = useAdmin();  // Added isAdmin and logout
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (data.success) {
        const token = data.token;
        localStorage.setItem('adminToken', token); // Store the token in local storage
        console.log(token);
        setAdmin(true, username, token); // Set status admin and token
        navigate("/"); // Navigate to the main page
      } else {
        setError("Login failed, please check your username/password!");
      }
    } catch (err) {
      setError("An error occurred during login.");
      console.error(err);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout(); // Clear the admin state
    navigate("/login"); // Navigate to the login page (or wherever you'd like)
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        {!isAdmin ? (
          <>
            <h2 className="text-2xl font-bold text-green-500 mb-4">Admin Login</h2>
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full p-2 border rounded mt-2"
                  placeholder="Enter your username"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded mt-2"
                  placeholder="Enter your password"
                />
              </div>
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded w-full"
              >
                Login
              </button>
            </form>
          </>
        ) : (
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium">Welcome, Admin</p>
            <LogOut onClick={handleLogout} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
