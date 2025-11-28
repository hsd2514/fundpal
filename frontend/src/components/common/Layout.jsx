import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import SideNav from './SideNav';
import useStore from '../../store/useStore';

const Layout = () => {
  const { isOnboarded } = useStore();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex">
      {isOnboarded && <SideNav />}
      
      <div className="flex-1 min-h-screen transition-all duration-300 ease-in-out">
        <div className={`h-full ${isOnboarded ? 'md:ml-64' : ''}`}>
          <div className="max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </div>
      </div>

      {isOnboarded && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      )}
    </div>
  );
};

export default Layout;
