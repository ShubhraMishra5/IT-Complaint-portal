import React from 'react';

export default function HeroSection() {
  return (
    <div id="hero-section" className="bg-white rounded p-4 pt-10 pb-10 m-6 shadow-inner">
      <h1 className="text-[#00164f] text-3xl font-bold">Welcome to,</h1>
      <h1 className="text-[#f37021] text-3xl font-bold">IT Complaint Management System</h1>
      <p className="font-semibold mt-2">Your one-stop solution for IT issues and support.</p>
      <p className="mt-1">
        Easily raise and track IT-related complaints—be it hardware, software or security.
        Get timely assistance from our dedicated engineering team.
      </p>
    </div>
  );
}