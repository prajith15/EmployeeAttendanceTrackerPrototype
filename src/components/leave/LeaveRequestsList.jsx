import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { useAuth } from '../../contexts/AuthContext';
import { formatDistanceToNow, format } from 'date-fns';
import { 
  CalendarDaysIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon 
} from '@heroicons/react/24/outline';

const LeaveRequestsList = () => {
  const { leaveRequests, loading, updateLeaveRequestStatus } = useLeaveRequests();
  const { user } = useAuth();

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-4 h-4" />;
      case 'rejected':
        return <XCircleIcon className="w-4 h-4" />;
      case 'pending':
        return <ClockIcon className="w-4 h-4" />;
      default:
        return <ClockIcon className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (requestId, status) => {
    const { error } = await updateLeaveRequestStatus(requestId, status, user.id);
    if (error) {
      console.error('Error updating leave request:', error);
    }
  };

  const canManageRequests = user?.role === 'hr' || user?.role === 'admin';

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading leave requests...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDaysIcon className="mr-2 h-5 w-5" />
          {canManageRequests ? 'All Leave Requests' : 'My Leave Requests'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {leaveRequests.length === 0 ? (
          <div className="text-center py-8">
            <CalendarDaysIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No leave requests</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canManageRequests 
                ? 'No leave requests have been submitted yet.' 
                : 'You haven\'t submitted any leave requests yet.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {leaveRequests.map((request) => (
              <div
                key={request.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="ml-1 capitalize">{request.status}</span>
                      </span>
                      <span className="text-sm text-gray-500 capitalize">
                        {request.leave_type.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {canManageRequests && request.employee && (
                      <div className="mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          {request.employee.full_name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {request.employee.employee_id} • {request.employee.department}
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Start Date</p>
                        <p className="text-sm font-medium">
                          {format(new Date(request.start_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">End Date</p>
                        <p className="text-sm font-medium">
                          {format(new Date(request.end_date), 'MMM dd, yyyy')}
                        </p>
                      </div>
                    </div>
                    
                    {request.reason && (
                      <div className="mb-2">
                        <p className="text-xs text-gray-500">Reason</p>
                        <p className="text-sm text-gray-700">{request.reason}</p>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>
                        Submitted {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                      </span>
                      {request.approved_at && request.approver && (
                        <span>
                          {request.status === 'approved' ? 'Approved' : 'Rejected'} by {request.approver.full_name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {canManageRequests && request.status === 'pending' && (
                    <div className="flex space-x-2 ml-4">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleStatusUpdate(request.id, 'approved')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleStatusUpdate(request.id, 'rejected')}
                      >
                        <XCircleIcon className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeaveRequestsList;