import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  BriefcaseIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

const LoginPortalSelector: React.FC = () => {
  const navigate = useNavigate();

  const handlePortalClick = (path: string) => {
    navigate(path);
  };
  const portals = [
    {
      title: 'Admin Portal',
      description: 'Full system administration access',
      icon: ShieldCheckIcon,
      path: '/admin-login',
      color: 'red',
      bgColor: 'from-red-50 to-orange-100',
      iconBg: 'bg-red-600',
      textColor: 'text-red-700',
      hoverColor: 'hover:border-red-300 hover:bg-red-50',
    },
    {
      title: 'HR Portal',
      description: 'Human resources management',
      icon: UserGroupIcon,
      path: '/hr-login',
      color: 'green',
      bgColor: 'from-green-50 to-emerald-100',
      iconBg: 'bg-green-600',
      textColor: 'text-green-700',
      hoverColor: 'hover:border-green-300 hover:bg-green-50',
    },
    {
      title: 'Manager Portal',
      description: 'Team and project management',
      icon: BriefcaseIcon,
      path: '/manager-login',
      color: 'blue',
      bgColor: 'from-blue-50 to-indigo-100',
      iconBg: 'bg-blue-600',
      textColor: 'text-blue-700',
      hoverColor: 'hover:border-blue-300 hover:bg-blue-50',
    },
    {
      title: 'Employee Portal',
      description: 'Employee self-service access',
      icon: UserIcon,
      path: '/employee-login',
      color: 'purple',
      bgColor: 'from-purple-50 to-pink-100',
      iconBg: 'bg-purple-600',
      textColor: 'text-purple-700',
      hoverColor: 'hover:border-purple-300 hover:bg-purple-50',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 sm:w-20 sm:h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <span className="text-2xl sm:text-3xl font-bold text-white">AT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            AttendanceTracker
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Select your login portal to access the system
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {portals.map((portal) => (
            <Card 
              key={portal.path} 
              className={`h-full transition-all duration-200 ${portal.hoverColor} cursor-pointer hover:scale-105`}
              onClick={() => handlePortalClick(portal.path)}
            >
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 ${portal.iconBg} rounded-full flex items-center justify-center mb-4`}>
                    <portal.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <CardTitle className={`text-lg sm:text-xl ${portal.textColor}`}>
                    {portal.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center pt-0">
                  <p className="text-gray-600 text-xs sm:text-sm">
                    {portal.description}
                  </p>
                  <div className="mt-4">
                    <span className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs font-medium ${portal.textColor} bg-opacity-10`}>
                      Click to Login
                    </span>
                  </div>
                </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPortalSelector;