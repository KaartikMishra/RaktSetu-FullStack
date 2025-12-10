import React from 'react';
import { Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Heart className="h-8 w-8 text-red-500" />
              <span className="text-2xl font-bold">RaktSetu</span>
            </div>
            <p className="text-gray-400 max-w-md">
              Connecting donors, blood banks, and hospitals to save lives through efficient blood management and real-time tracking.
            </p>
          </div>

          
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 BloodConnect. All rights reserved. | Saving lives through technology.</p>
        </div>
      </div>
    </footer>
  );
};