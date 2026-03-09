import React from 'react';
import HeroSection from '../components/HeroSection';
import ActionCards from '../components/ActionCards';

export default function Home({ isLoggedIn, onProtectedClick, userRole }) {
  return (
    <>
      <HeroSection />
      <ActionCards
        isLoggedIn={isLoggedIn}
        onProtectedClick={onProtectedClick}
        userRole={userRole}
      />
    </>
  );
}