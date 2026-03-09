import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/IndianOil.png';
import userIcon from '../assets/user-icon.png';

export default function Navbar({ isLoggedIn, userRole, onSignInClick, onSignOutClick, onProtectedClick }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleNav = (path) => {
    if (isLoggedIn) {
      navigate(path);
    } else {
      onProtectedClick(path);
    }
  };

  return (
    <div className="bg-white border-b-[10px] border-[#00164f] p-5 flex items-center h-[120px]">
      <div className="mr-auto">
        <a href='/'><img src={logo} alt="Logo" className="h-[80px]" /></a>
      </div>

      <div className="flex gap-4 items-center relative">
        <button onClick={() => handleNav('/dashboard')} className="hover:bg-black/10 rounded px-3 py-2">
          Dashboard
        </button>

        {/* Activity Dropdown */}
        <div
          className="relative"
          onMouseEnter={() => setShowDropdown(true)}
          onMouseLeave={() => setShowDropdown(false)}
        >
          <button className="hover:bg-black/10 rounded px-3 py-2">Activity</button>

          {showDropdown && (
            <div className="absolute top-full left-0 mt-0.5 bg-white border border-gray-200 shadow-md rounded z-50 w-52">
              {isLoggedIn && userRole === 'admin' && (
                <>
                  <button onClick={() => navigate('/admin-view-complaints')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Assign Complaint
                  </button>
                  <button onClick={() => navigate('/admin-remarks')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Admin Remarks
                  </button>
                  <button onClick={() => navigate('/manage-table')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Manage Table
                  </button>
                </>
              )}
              {isLoggedIn && userRole === 'engineer' && (
                <button onClick={() => navigate('/assigned-complaints')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Assigned Complaints
                </button>
              )}
              {isLoggedIn && userRole === 'it-dept' && (
                <button onClick={() => navigate('/reports')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Reports
                </button>
              )}
              {isLoggedIn && userRole === 'employee' && (
                <>
                  <button onClick={() => navigate('/raise')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    Raise Complaint
                  </button>
                  <button onClick={() => navigate('/employee-complaint-history')} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                    My Complaints
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        <button onClick={() => handleNav('/track-status')} className="hover:bg-black/10 rounded px-3 py-2">
          Track Status
        </button>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {isLoggedIn ? (
          <button onClick={onSignOutClick} className="hover:bg-black/10 rounded px-3 py-2">
            Sign Out
          </button>
        ) : (
          <button onClick={onSignInClick} className="hover:bg-black/10 rounded px-3 py-2">
            Sign In
          </button>
        )}
        <img src={userIcon} alt="User Icon" className="h-[25px]" />
      </div>
    </div>
  );
}
