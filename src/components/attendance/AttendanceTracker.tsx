import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import Button from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import {
  ClockIcon,
  PlayIcon,
  StopIcon,
  PauseIcon,
} from '@heroicons/react/24/outline';

interface AttendanceStatus {
  isCheckedIn: boolean;
  checkInTime?: string;
  checkOutTime?: string;
  totalHours: number;
  status: 'offline' | 'working' | 'break';
}

const AttendanceTracker: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceStatus>({
    isCheckedIn: false,
    totalHours: 0,
    status: 'offline',
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    const now = new Date().toISOString();
    setAttendance(prev => ({
      ...prev,
      isCheckedIn: true,
      checkInTime: now,
      status: 'working',
    }));
    
    // TODO: Save to database
    console.log('Check in:', now);
  };

  const handleCheckOut = async () => {
    const now = new Date().toISOString();
    const checkInTime = new Date(attendance.checkInTime || now);
    const checkOutTime = new Date(now);
    const hours = (checkOutTime.getTime() - checkInTime.getTime()) / (1000 * 60 * 60);
    
    setAttendance(prev => ({
      ...prev,
      isCheckedIn: false,
      checkOutTime: now,
      totalHours: hours,
      status: 'offline',
    }));
    
    // TODO: Save to database
    console.log('Check out:', now);
  };

  const handleBreak = () => {
    setAttendance(prev => ({
      ...prev,
      status: prev.status === 'break' ? 'working' : 'break',
    }));
  };

  const getStatusColor = () => {
    switch (attendance.status) {
      case 'working':
        return 'text-green-600 bg-green-50';
      case 'break':
        return 'text-yellow-600 bg-yellow-50';
      case 'offline':
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = () => {
    switch (attendance.status) {
      case 'working':
        return 'Working';
      case 'break':
        return 'On Break';
      case 'offline':
        return 'Offline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ClockIcon className="mr-2 h-5 w-5" />
            Attendance Tracker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Current Time */}
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-gray-900">
                {format(currentTime, 'HH:mm:ss')}
              </div>
              <div className="text-sm text-gray-500">
                {format(currentTime, 'EEEE, MMMM d, yyyy')}
              </div>
            </div>

            {/* Status */}
            <div className="text-center">
              <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getStatusColor()}`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  attendance.status === 'working' ? 'bg-green-500' :
                  attendance.status === 'break' ? 'bg-yellow-500' : 'bg-gray-500'
                }`} />
                {getStatusText()}
              </div>
              <div className="text-xs text-gray-500 mt-1">Current Status</div>
            </div>

            {/* Working Hours */}
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {attendance.totalHours.toFixed(1)}h
              </div>
              <div className="text-xs text-gray-500">Total Hours Today</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            {!attendance.isCheckedIn ? (
              <Button
                onClick={handleCheckIn}
                className="flex items-center justify-center"
                variant="primary"
              >
                <PlayIcon className="mr-2 h-4 w-4" />
                Check In
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleCheckOut}
                  className="flex items-center justify-center"
                  variant="destructive"
                >
                  <StopIcon className="mr-2 h-4 w-4" />
                  Check Out
                </Button>
                <Button
                  onClick={handleBreak}
                  className="flex items-center justify-center"
                  variant="secondary"
                >
                  <PauseIcon className="mr-2 h-4 w-4" />
                  {attendance.status === 'break' ? 'End Break' : 'Take Break'}
                </Button>
              </>
            )}
          </div>

          {/* Times Display */}
          {(attendance.checkInTime || attendance.checkOutTime) && (
            <div className="mt-6 grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              {attendance.checkInTime && (
                <div>
                  <div className="text-sm text-gray-500">Check In</div>
                  <div className="font-medium">
                    {format(new Date(attendance.checkInTime), 'HH:mm:ss')}
                  </div>
                </div>
              )}
              {attendance.checkOutTime && (
                <div>
                  <div className="text-sm text-gray-500">Check Out</div>
                  <div className="font-medium">
                    {format(new Date(attendance.checkOutTime), 'HH:mm:ss')}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceTracker;