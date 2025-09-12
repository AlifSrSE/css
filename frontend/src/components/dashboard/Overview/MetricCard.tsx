import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../../common/Layout/Card';
import { cn } from '../../../utils/cn';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon,
  className,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </div>
            <div className="h-8 w-8 bg-gray-200 rounded"></div>
          </div>
          {change && (
            <div className="mt-4 h-4 bg-gray-200 rounded w-32"></div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className="text-blue-600">
            {icon}
          </div>
        </div>
        
        {change && (
          <div className="mt-4 flex items-center text-sm">
            {change.type === 'increase' ? (
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
            )}
            <span
              className={cn(
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              )}
            >
              {change.value > 0 ? '+' : ''}{change.value}%
            </span>
            <span className="text-gray-600 ml-1">{change.period}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};