// src/pages/ResetPassword.jsx
import React, { useState } from 'react';
import axios from '../components/api';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }
    try {
      const res = await axios.post(
        '/auth/reset-password',
        { new_password: newPassword },
        { withCredentials: true }
      );
      setMessage(res.data.message);
      setTimeout(() => navigate('/dashboard'), 1500); // Redirect after success
    } catch (err) {
      setMessage(err.response?.data?.error || "Error resetting password.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-xl shadow-lg">
      <h2 className="text-xl font-bold text-center mb-4 text-[#00164f]">Reset Password</h2>
      {message && (
        <div className="text-center text-sm text-red-500 mb-4">{message}</div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-full"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700">Confirm Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 border rounded-full"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-[#00164f] text-white py-2 rounded-full hover:bg-[#004077]"
        >
          Update Password
        </button>
      </form>
    </div>
  );
}
