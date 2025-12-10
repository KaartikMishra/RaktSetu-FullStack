import React from 'react';
import { Heart } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="relative">
          <Heart className="h-12 w-12 text-red-600 mx-auto animate-pulse" />
          <div className="absolute inset-0 rounded-full border-2 border-red-600 border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">{message}</p>
      </div>
    </div>
  );
};