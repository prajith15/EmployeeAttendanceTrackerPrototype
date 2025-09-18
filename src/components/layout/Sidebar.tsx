import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
  HomeIcon,
  UsersIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const { user } = useAuth();
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: getDashboardRoute(), icon: HomeIcon },
      { name: 'Attendance', href: '/attendance', icon: ClockIcon },
      { name: 'Tasks', href: '/tasks', icon: BriefcaseIcon },
      { name: 'Leave', href: '/leave', icon: CalendarDaysIcon },
    ];

    const roleSpecificItems = {
      admin: [
        { name: 'Users', href: '/users', icon: UsersIcon },
        { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
        { name: 'Policies', href: '/policies', icon: DocumentTextIcon },
        { name: 'Settings', href: '/settings', icon: CogIcon },
      ],
      manager: [
        { name: 'Team', href: '/team', icon: UsersIcon },
        { name: 'Reports', href: '/reports', icon: ChartBarIcon },
      ],
      hr: [
        { name: 'Employees', href: '/employees', icon: UsersIcon },
        { name: 'Reports', href: '/reports', icon: ChartBarIcon },
      ],
      employee: [
        { name: 'My Profile', href: '/profile', icon: UsersIcon },
      ],
    };

    return [
      ...baseItems,
      ...(roleSpecificItems[user?.role as keyof typeof roleSpecificItems] || []),
    ];
  };

  const getDashboardRoute = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'hr':
        return '/hr/dashboard';
      case 'manager':
        return '/manager/dashboard';
      case 'employee':
        return '/employee/dashboard';
      default:
        return '/dashboard';
    }
  };

  const navigation = getNavigationItems();

  const SidebarContent = () => (
    <>
      <div className="flex items-center h-14 sm:h-16 px-3 sm:px-4 bg-blue-600">
        <div className="flex items-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-bold text-xs sm:text-sm">AT</span>
          </div>
          <span className="ml-2 sm:ml-3 text-white font-semibold text-sm sm:text-lg">AttendanceTracker</span>
        </div>
      </div>
      
      <nav className="mt-3 sm:mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center px-2 py-2 text-xs sm:text-sm font-medium rounded-md transition-colors duration-200',
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )}
              onClick={() => onClose()}
            >
              <item.icon
                className={cn(
                  'mr-2 sm:mr-3 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0',
                  isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                )}
              />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={onClose}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <SidebarContent />
        </div>
      </div>
    </>
  );
};

export default Sidebar;