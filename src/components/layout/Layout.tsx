import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from '../notifications/NotificationBell';
import {
  Bars3Icon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { Menu, Transition } from '@headlessui/react';
import Sidebar from './Sidebar';
import Button from '../ui/Button';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main content */}
      <div className="lg:pl-64 min-h-screen">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 flex h-14 sm:h-16 bg-white border-b border-gray-200 lg:border-none">
          <button
            type="button"
            className="px-3 sm:px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          
          <div className="flex flex-1 justify-between px-3 sm:px-4 lg:px-6">
            <div className="flex flex-1">
              {/* Search can be added here */}
            </div>
            
            <div className="ml-2 sm:ml-4 flex items-center space-x-2 sm:space-x-4">
              {/* Notifications */}
              <NotificationBell />

              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <Menu.Button className="flex max-w-xs items-center rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 lg:rounded-md lg:p-1 lg:hover:bg-gray-50">
                  <UserCircleIcon className="h-6 w-6 sm:h-8 sm:w-8 rounded-full" />
                  <span className="ml-2 hidden text-xs sm:text-sm font-medium text-gray-700 lg:block">
                    {user?.full_name}
                  </span>
                  <span className="ml-1 hidden text-xs text-gray-500 xl:block capitalize">
                    {user?.role}
                  </span>
                </Menu.Button>
                
                <Transition
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <UserCircleIcon className="mr-3 h-5 w-5" />
                        Your Profile
                      </button>
                    </Menu.Item>
                    <Menu.Item>
                      <button className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Cog6ToothIcon className="mr-3 h-5 w-5" />
                        Settings
                      </button>
                    </Menu.Item>
                    <Menu.Item>
                      <button
                        onClick={handleSignOut}
                        className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
                        Sign out
                      </button>
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;