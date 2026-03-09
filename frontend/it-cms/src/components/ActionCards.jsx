import React from 'react';
import raiseIcon from '../assets/raise-complaint.png';
import trackIcon from '../assets/track-status.png';

export default function ActionCards({ isLoggedIn, onProtectedClick, userRole }) {
  const handleRaiseComplaint = () => {
    if (isLoggedIn && userRole === 'employee') {
      onProtectedClick('/raise');
    } else if (isLoggedIn) {
      onProtectedClick('/dashboard');
    } else {
      onProtectedClick('/raise');
    }
  };

  const handleTrackStatus = () => {
    if (isLoggedIn && userRole === 'employee') {
      onProtectedClick('/track-status');
    } else if (isLoggedIn) {
      onProtectedClick('/dashboard');
    } else {
      onProtectedClick('/track-status');
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-24 my-24">
      <button onClick={handleRaiseComplaint} className="hover:bg-black/10 rounded px-6 py-4 transition-all duration-200">
        <img src={raiseIcon} alt="Raise Complaint" className="h-[100px] mx-auto mb-2" />
        <p className="text-lg font-bold text-[#00164f]">Raise Complaints</p>
      </button>
      <button onClick={handleTrackStatus} className="hover:bg-black/10 rounded px-6 py-4 transition-all duration-200">
        <img src={trackIcon} alt="Track Status" className="h-[100px] mx-auto mb-2" />
        <p className="text-lg font-bold text-[#00164f]">Track Status</p>
      </button>
    </div>
  );
}