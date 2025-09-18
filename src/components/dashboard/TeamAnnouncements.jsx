import React from 'react';
import { Bell, Pin, Calendar } from 'lucide-react';

const TeamAnnouncements = () => {
  const announcements = [
    {
      id: 1,
      title: 'Company All-Hands Meeting',
      content: 'Join us for our quarterly all-hands meeting this Friday at 2 PM.',
      date: '2024-01-15',
      priority: 'high',
      isPinned: true
    },
    {
      id: 2,
      title: 'New HR Policy Updates',
      content: 'Please review the updated remote work policy in the employee handbook.',
      date: '2024-01-12',
      priority: 'medium',
      isPinned: false
    },
    {
      id: 3,
      title: 'Holiday Schedule',
      content: 'Updated holiday schedule for 2024 is now available on the portal.',
      date: '2024-01-10',
      priority: 'low',
      isPinned: false
    }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  return React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
    React.createElement('div', { className: 'flex items-center justify-between mb-4' },
      React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Team Announcements'),
      React.createElement('button', { className: 'text-sm text-blue-600 hover:text-blue-800' }, 'View all')
    ),
    React.createElement('div', { className: 'space-y-4' },
      announcements.map((announcement) =>
        React.createElement('div', { 
          key: announcement.id, 
          className: `border-l-4 p-4 rounded-r-lg ${getPriorityColor(announcement.priority)}` 
        },
          React.createElement('div', { className: 'flex items-start justify-between' },
            React.createElement('div', { className: 'flex-1' },
              React.createElement('div', { className: 'flex items-center space-x-2 mb-1' },
                React.createElement('h4', { className: 'text-sm font-semibold text-gray-900' }, announcement.title),
                announcement.isPinned && React.createElement(Pin, { className: 'w-4 h-4 text-gray-500' })
              ),
              React.createElement('p', { className: 'text-sm text-gray-600 mb-2' }, announcement.content),
              React.createElement('div', { className: 'flex items-center text-xs text-gray-500' },
                React.createElement(Calendar, { className: 'w-3 h-3 mr-1' }),
                React.createElement('span', null, new Date(announcement.date).toLocaleDateString())
              )
            ),
            React.createElement(Bell, { className: 'w-4 h-4 text-gray-400 mt-1' })
          )
        )
      )
    )
  );
};

export default TeamAnnouncements;