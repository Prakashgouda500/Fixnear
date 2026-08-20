import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const CustomerLayout = () => {
  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
