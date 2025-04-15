import React from 'react';
import { FileQuestion } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  title, 
  message, 
  icon = <FileQuestion size={48} className="text-gray-400" />,
  action 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white rounded-lg shadow-sm">
      <div className="mb-4">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mb-6 text-sm text-gray-500">{message}</p>
      {action && (
        <div className="mt-2">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;