import React from 'react';
import { Users, Clock, Calendar, CheckCircle, AlertCircle, UserCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import DashboardStats from '../components/dashboard/DashboardStats';
import RecentActivity from '../components/dashboard/RecentActivity';
import AttendanceTracker from '../components/attendance/AttendanceTracker';
import TeamAnnouncements from '../components/dashboard/TeamAnnouncements';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  // Mock data - in real app, this would come from API
  const stats = [
    {
      title: 'Total Employees',
      value: '150',
      change: '+5',
      trend: 'up' as const,
      icon: Users,
    },
    {
      title: 'Present Today',
      value: '142',
      change: '+8',
      trend: 'up' as const,
      icon: UserCheck,
    },
    {
      title: 'Late Today',
      value: '8',
      change: '-2',
      trend: 'down' as const,
      icon: Clock,
    },
    {
      title: 'On Leave',
      value: '5',
      change: '+1',
      trend: 'up' as const,
      icon: Calendar,
    },
    {
      title: 'Pending Tasks',
      value: '23',
      change: '-5',
      trend: 'down' as const,
      icon: AlertCircle,
    },
    {
      title: 'Completed Tasks',
      value: '67',
      change: '+12',
      trend: 'up' as const,
      icon: CheckCircle,
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'check_in' as const,
      user: 'John Smith',
      description: 'Checked in at 9:00 AM',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      type: 'task_completed' as const,
      user: 'Sarah Johnson',
      description: 'Completed quarterly report review',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    },
    {
      id: '3',
      type: 'leave_applied' as const,
      user: 'Mike Davis',
      description: 'Applied for sick leave',
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'check_out' as const,
      user: 'Emily Wilson',
      description: 'Checked out at 6:00 PM',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    },
  ];

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {user?.full_name}!
          </h1>
          <p className="text-gray-600">
            Here's what's happening at your organization today.
          </p>
        </div>

        <div className="space-y-8">
          {/* Stats Overview */}
          <DashboardStats stats={stats} />

          {/* Two-column layout for larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Attendance Tracker */}
            <div>
              <AttendanceTracker />
            </div>

            {/* Recent Activity */}
            <div>
              <RecentActivity activities={recentActivities} />
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-medium text-gray-900">View Team</div>
                <div className="text-sm text-gray-500">Manage your team members</div>
              </button>
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                <div className="text-2xl mb-2">📋</div>
                <div className="font-medium text-gray-900">Assign Tasks</div>
                <div className="text-sm text-gray-500">Create and assign new tasks</div>
              </button>
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-medium text-gray-900">View Reports</div>
                <div className="text-sm text-gray-500">Generate attendance reports</div>
              </button>
              <button className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200">
                <div className="text-2xl mb-2">⚙️</div>
                <div className="font-medium text-gray-900">Settings</div>
                <div className="text-sm text-gray-500">Configure system settings</div>
              </button>
            </div>
          </div>

          {/* Team Announcements */}
          <div>
            <TeamAnnouncements />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;