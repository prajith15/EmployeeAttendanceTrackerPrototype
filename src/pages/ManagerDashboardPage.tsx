import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import { Users, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const ManagerDashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { title: 'Team Members', value: '12', icon: Users, color: 'bg-blue-500' },
    { title: 'Team Performance', value: '94%', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Pending Approvals', value: '5', icon: Clock, color: 'bg-orange-500' },
    { title: 'Completed Projects', value: '8', icon: CheckCircle, color: 'bg-purple-500' }
  ];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
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
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Overview</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">John Smith</p>
                  <p className="text-sm text-gray-600">Frontend Developer</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-gray-600">Backend Developer</p>
                </div>
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">Mike Wilson</p>
                  <p className="text-sm text-gray-600">UI/UX Designer</p>
                </div>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">On Leave</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Pending Approvals</h2>
            <div className="space-y-3">
              <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                <p className="font-medium">Leave Request - John Smith</p>
                <p className="text-sm text-gray-600">Vacation: Dec 20-25</p>
                <div className="mt-2 space-x-2">
                  <button className="px-3 py-1 bg-green-500 text-white rounded text-xs">Approve</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded text-xs">Reject</button>
                </div>
              </div>
              <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                <p className="font-medium">Overtime Request - Sarah Johnson</p>
                <p className="text-sm text-gray-600">Weekend work: 8 hours</p>
                <div className="mt-2 space-x-2">
                  <button className="px-3 py-1 bg-green-500 text-white rounded text-xs">Approve</button>
                  <button className="px-3 py-1 bg-red-500 text-white rounded text-xs">Reject</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ManagerDashboardPage;