import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const DashboardStats = ({ stats = [] }) => {
  return React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6' },
    stats.map((stat, index) => {
      const IconComponent = stat.icon;
      const isPositive = stat.trend === 'up';
      const TrendIcon = isPositive ? TrendingUp : TrendingDown;
      const trendColor = isPositive ? 'text-green-600' : 'text-red-600';
      
      return React.createElement('div', { 
        key: index, 
        className: 'bg-white rounded-lg shadow p-6' 
      },
        React.createElement('div', { className: 'flex items-center justify-between' },
          React.createElement('div', null,
            React.createElement('p', { className: 'text-sm font-medium text-gray-600' }, stat.title),
            React.createElement('p', { className: 'text-2xl font-bold text-gray-900 mt-1' }, stat.value)
          ),
          React.createElement('div', { className: 'p-3 bg-blue-50 rounded-full' },
            React.createElement(IconComponent, { className: 'w-6 h-6 text-blue-600' })
          )
        ),
        React.createElement('div', { className: 'flex items-center mt-4' },
          React.createElement(TrendIcon, { className: `w-4 h-4 ${trendColor} mr-1` }),
          React.createElement('span', { className: `text-sm font-medium ${trendColor}` }, stat.change),
          React.createElement('span', { className: 'text-sm text-gray-600 ml-1' }, 'from last month')
        )
      );
    })
  );
};

export default DashboardStats;