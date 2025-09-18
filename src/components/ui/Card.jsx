import React from 'react';
import { cn } from '../../lib/utils';

const Card = ({ children, className, onClick }) => {
  return (
    <div 
      className={cn(
        'bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200',
        onClick && 'cursor-pointer hover:border-gray-300',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-4 border-b border-gray-200', className)}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className }) => {
  return (
    <div className={cn('px-6 py-4', className)}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, className }) => {
  return (
    <h3 className={cn('text-lg font-semibold text-gray-900', className)}>
      {children}
    </h3>
  );
};

export { Card, CardHeader, CardContent, CardTitle };