import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useLeaveRequests } from '../../hooks/useLeaveRequests';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

const LeaveRequestForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    leave_type: 'vacation',
    start_date: '',
    end_date: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { createLeaveRequest } = useLeaveRequests();

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate dates
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      setError('Start date cannot be in the past');
      setLoading(false);
      return;
    }

    if (endDate < startDate) {
      setError('End date cannot be before start date');
      setLoading(false);
      return;
    }

    try {
      const { error } = await createLeaveRequest(formData);
      
      if (error) {
        setError(error.message);
      } else {
        // Reset form
        setFormData({
          leave_type: 'vacation',
          start_date: '',
          end_date: '',
          reason: '',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <CalendarDaysIcon className="mr-2 h-5 w-5" />
          Request Leave
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Leave Type
            </label>
            <select
              name="leave_type"
              value={formData.leave_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="vacation">Vacation</option>
              <option value="sick">Sick Leave</option>
              <option value="personal">Personal Leave</option>
              <option value="emergency">Emergency Leave</option>
              <option value="maternity">Maternity Leave</option>
              <option value="paternity">Paternity Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              name="start_date"
              label="Start Date"
              value={formData.start_date}
              onChange={handleInputChange}
              required
            />
            <Input
              type="date"
              name="end_date"
              label="End Date"
              value={formData.end_date}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <textarea
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a reason for your leave request..."
            />
          </div>

          <Button
            type="submit"
            loading={loading}
            className="w-full"
          >
            Submit Leave Request
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default LeaveRequestForm;