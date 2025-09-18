import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Users, UserPlus, Calendar, Briefcase } from 'lucide-react';

const HRDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Total Employees', value: '156', icon: Users, color: 'bg-blue-500' },
    { title: 'New Hires This Month', value: '8', icon: UserPlus, color: 'bg-green-500' },
    { title: 'Leave Requests', value: '12', icon: Calendar, color: 'bg-orange-500' },
    { title: 'Open Positions', value: '5', icon: Briefcase, color: 'bg-purple-500' }
  ];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">HR Dashboard</h1>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Leave Requests</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-gray-600">Vacation: Dec 20-25</p>
                </div>
                <div className="space-x-2">
                  <button className="px-3 py-1 bg-green-500 text-white rounded text-xs">Approve</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded text-xs">Reject</button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-600">Sick Leave: Dec 18-19</p>
                </div>
                <div className="space-x-2">
                  <button className="px-3 py-1 bg-green-500 text-white rounded text-xs">Approve</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded text-xs">Reject</button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">New Hires Onboarding</h2>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                <p className="font-medium">Alex Chen</p>
                <p className="text-sm text-gray-600">Software Engineer - Day 3</p>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
              <div className="p-3 border-l-4 border-green-500 bg-green-50">
                <p className="font-medium">Maria Rodriguez</p>
                <p className="text-sm text-gray-600">Marketing Specialist - Day 7</p>
                <div className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{width: '90%'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default HRDashboardPage;