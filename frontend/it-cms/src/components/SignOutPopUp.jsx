import React from 'react';
import axios from './api';

const SignOutPopup = ({ show, onClose, onConfirm }) => {
  if (!show) return null;


  const handleSignOut = async () => {
    try {
      await axios.post('/auth/logout', {}, {withCredentials: true});
      onConfirm();
    } catch (error) {
      alert('Logout failed: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
        <h1 className="text-lg font-bold text-[#00164f] mb-4">SIGN OUT</h1>
        <p className="text-[#000000] mb-6">Are you sure you want to sign out?</p>
        <div className="flex justify-between gap-4">
          <button
            onClick={handleSignOut}
            className="flex-1 bg-[#00164f] hover:bg-[#004077] text-white py-2 rounded-full"
          >
            Sign Out
          </button>
          <button
            onClick={onClose}
            className="flex-1 border bg-[#5f5f5f] text-white hover:bg-[#9a9a9a] py-2 rounded-full"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignOutPopup;
