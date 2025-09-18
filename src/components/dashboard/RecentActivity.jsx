import React from 'react';
import { Clock, User, Settings, CheckCircle, FileText } from 'lucide-react';

const RecentActivity = ({ activities }) => {
  // Ensure activities is always an array
  const safeActivities = Array.isArray(activities) ? activities : [];
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_creation':
        return User;
      case 'settings_update':
        return Settings;
      case 'approval':
        return CheckCircle;
      case 'report_generation':
        return FileText;
      default:
        return Clock;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case 'user_creation':
        return 'text-blue-600 bg-blue-100';
      case 'settings_update':
        return 'text-orange-600 bg-orange-100';
      case 'approval':
        return 'text-green-600 bg-green-100';
      case 'report_generation':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Recent Activity'),
      React.createElement('button', { className: 'text-sm text-blue-600 hover:text-blue-800' }, 'View all')
    ),
    React.createElement('div', { className: 'space-y-4' },
      safeActivities.length === 0 
        ? React.createElement('p', { className: 'text-gray-500 text-center py-4' }, 'No recent activities')
        : safeActivities.map((activity) => {
            const IconComponent = getActivityIcon(activity.type);
            const colorClasses = getActivityColor(activity.type);
            
            return React.createElement('div', {
              key: activity.id || `activity-${Math.random()}`,
              className: 'flex items-start space-x-3'
            },
              React.createElement('div', { className: `p-2 rounded-full ${colorClasses}` },
                React.createElement(IconComponent, { className: 'w-4 h-4' })
              ),
              React.createElement('div', { className: 'flex-1 min-w-0' },
                React.createElement('p', { className: 'text-sm font-medium text-gray-900' }, activity.user || 'Unknown User'),
                React.createElement('p', { className: 'text-sm text-gray-600' }, activity.action || 'No action specified'),
                React.createElement('p', { className: 'text-xs text-gray-400 mt-1' }, activity.timestamp || 'Unknown time')
              )
            );
          })
    )
  );
};

// Set default props
RecentActivity.defaultProps = {
  activities: []
};

export default RecentActivity;