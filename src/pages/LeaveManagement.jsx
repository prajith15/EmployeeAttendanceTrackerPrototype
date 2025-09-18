import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import LeaveRequestForm from '../components/leave/LeaveRequestForm';
import LeaveRequestsList from '../components/leave/LeaveRequestsList';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { CalendarDaysIcon, PlusIcon } from '@heroicons/react/24/outline';

const LeaveManagement = () => {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);

  const isEmployee = user?.role === 'employee';
  const canManageRequests = user?.role === 'hr' || user?.role === 'admin';

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
              <p className="text-gray-600">
                {canManageRequests 
                  ? 'Manage employee leave requests and approvals'
                  : 'Submit and track your leave requests'
                }
              </p>
            </div>
            {isEmployee && (
              <Button
                onClick={() => setShowRequestForm(!showRequestForm)}
                className="flex items-center"
              >
                <PlusIcon className="w-4 h-4 mr-2" />
                {showRequestForm ? 'Cancel' : 'Request Leave'}
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Leave Request Form - Only for employees */}
          {isEmployee && showRequestForm && (
            <LeaveRequestForm 
              onSuccess={() => {
                setShowRequestForm(false);
              }}
            />
          )}

          {/* Leave Requests List */}
          <LeaveRequestsList />

          {/* Leave Statistics - For HR/Admin */}
          {canManageRequests && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-yellow-100 rounded-full">
                      <CalendarDaysIcon className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pending Requests</p>
                      <p className="text-2xl font-bold text-gray-900">5</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-green-100 rounded-full">
                      <CalendarDaysIcon className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Approved This Month</p>
                      <p className="text-2xl font-bold text-gray-900">23</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <CalendarDaysIcon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Requests</p>
                      <p className="text-2xl font-bold text-gray-900">156</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default LeaveManagement;