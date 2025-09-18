import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Clock, CheckSquare, Calendar, User } from 'lucide-react';

const EmployeeDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Hours This Week', value: '38.5', icon: Clock, color: 'bg-blue-500' },
    { title: 'Tasks Completed', value: '12', icon: CheckSquare, color: 'bg-green-500' },
    { title: 'Leave Balance', value: '15 days', icon: Calendar, color: 'bg-purple-500' },
    { title: 'Pending Tasks', value: '3', icon: User, color: 'bg-orange-500' }
  ];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.full_name}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition">
                Clock In/Out
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition">
                Request Leave
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition">
                View Timesheet
              </button>
              <button className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition">
                Update Profile
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h2>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                <p className="font-medium">Complete project documentation</p>
                <p className="text-sm text-gray-600">Due: Today</p>
              </div>
              <div className="p-3 border-l-4 border-green-500 bg-green-50">
                <p className="font-medium">Review team feedback</p>
                <p className="text-sm text-gray-600">Due: Tomorrow</p>
              </div>
              <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                <p className="font-medium">Prepare presentation</p>
                <p className="text-sm text-gray-600">Due: Friday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EmployeeDashboardPage;