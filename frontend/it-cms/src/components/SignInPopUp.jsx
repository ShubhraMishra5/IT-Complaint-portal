import React, { useState } from 'react';
import axios from './api';

export default function SignInPopup({ show, onClose, onLogin }) {
  const [employeeId, setEmployeeId] = useState('');
  const [role, setRole] = useState('employee');
  const [password, setPassword] = useState('');

  console.log("Submitting login with:", {
  employee_id: employeeId,
  password,
  role,
});

  
  const handleSubmit = async (e) => {
  e.preventDefault();

  const payload =
    role === 'engineer'
      ? { engineer_id: employeeId, password, role }
      : { employee_id: employeeId, password, role };

  console.log("Submitting login with:", payload);

  try {
    const response = await axios.post('/auth/login', payload, {
      withCredentials: true,
    });

    const data = response.data;
    onLogin({ employeeId, role, password });
    onClose();
  } catch (err) {
    console.log("Login Error:", err);
    alert('Login failed: ' + (err.response?.data?.error || 'Unknown error'));
  }
};


  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#d9d9d9] p-6 rounded-xl w-[420px] shadow-xl animate-fadeIn">
        <h1 className="text-center text-[#00164f] text-xl font-bold mb-4">SIGN IN</h1>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="mb-2 text-[#000000]">
            Username
            <input
              type="text"
              placeholder="Enter employee ID"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 mb-3 rounded-full border border-[#20232d]"
            />
          </label>
          <label className="mb-2 text-[#000000]">
            User Role
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 mb-3 rounded-full border border-[#20232d]"
            >
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
              <option value="engineer">Engineer</option>
              <option value="management">Management</option>
            </select>
          </label>
          <label className="mb-2 text-[#000000]">
            Password
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 mt-1 mb-3 rounded-full border border-[#20232d]"
            />
          </label>
          <button
            type="submit"
            className="w-full bg-[#00164f] hover:bg-[#004077] text-white py-2 rounded-full"
          >
            Sign In
          </button>
        </form>
        <button onClick={onClose} className="mt-4 w-full text-sm text-[#5f5f5f] underline">
          Cancel
        </button>
      </div>
    </div>
  );
}
