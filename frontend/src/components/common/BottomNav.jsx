import React from 'react';
import { Home, LayoutDashboard, Target, History, User, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import clsx from 'clsx';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Chat', path: '/' },
    { icon: LayoutDashboard, label: 'Dash', path: '/dashboard' },
    { icon: Target, label: 'Goals', path: '/goals' },
    { icon: TrendingUp, label: 'Invest', path: '/investments' },
    { icon: History, label: 'Txns', path: '/transactions' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={clsx(
                'flex flex-col items-center justify-center w-full h-full space-y-1',
                isActive ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
