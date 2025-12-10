import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'indigo';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  description?: string;
}

const colorClasses = {
  red: {
    bg: 'bg-red-500',
    light: 'bg-red-50',
    text: 'text-red-600',
    border: 'border-red-200'
  },
  blue: {
    bg: 'bg-blue-500',
    light: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200'
  },
  green: {
    bg: 'bg-green-500',
    light: 'bg-green-50',
    text: 'text-green-600',
    border: 'border-green-200'
  },
  yellow: {
    bg: 'bg-yellow-500',
    light: 'bg-yellow-50',
    text: 'text-yellow-600',
    border: 'border-yellow-200'
  },
  purple: {
    bg: 'bg-purple-500',
    light: 'bg-purple-50',
    text: 'text-purple-600',
    border: 'border-purple-200'
  },
  indigo: {
    bg: 'bg-indigo-500',
    light: 'bg-indigo-50',
    text: 'text-indigo-600',
    border: 'border-indigo-200'
  }
};

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  description
}) => {
  const colors = colorClasses[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white p-6 rounded-xl shadow-md border ${colors.border} hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          
          {trend && (
            <div className={`flex items-center mt-2 text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className={`font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        
        <div className={`${colors.light} p-3 rounded-lg`}>
          <Icon className={`h-8 w-8 ${colors.text}`} />
        </div>
      </div>
    </motion.div>
  );
};