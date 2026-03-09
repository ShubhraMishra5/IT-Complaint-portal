import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Footer({ isLoggedIn, onProtectedAction }) {
  const navigate = useNavigate();
  const handleClick = (path) => {
    if (isLoggedIn) navigate(path);
    else onProtectedAction(path);
  };

  return (
    <footer className="bg-[#00164f] p-6 text-white flex flex-col items-center space-y-2 mt-auto">
      {isLoggedIn ? (
        <>
          <button onClick={() => handleClick('/dashboard')} className="hover:underline">Dashboard</button>
          <button onClick={() => handleClick('/reset-password')} className="hover:underline">Reset Password</button>
        </>
      ) : (
        <>
          <button onClick={() => handleClick('/dashboard')} className="hover:underline">Dashboard</button>
          <button onClick={() => handleClick('/reset-password')} className="hover:underline">Reset Password</button>
        </>
      )}
      <a href="/about" className="hover:underline">About</a>
      <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:underline">Back to top</button>
    </footer>
  );
}