import React from 'react';
import { Clock, User, FileText, CheckCircle, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { StatusBadge } from '../../common/Tables/StatusBadge';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  type: 'application_created' | 'score_calculated' | 'report_generated' | 'user_login';
  title: string;
  description: string;
  timestamp: Date;
  user: string;
  status?: 'success' | 'warning' | 'error';
}

interface RecentActivityProps {
  activities?: ActivityItem[];
  loading?: boolean;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [],
  loading = false,
}) => {
  // Mock data if no activities provided
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'score_calculated',
      title: 'Credit Score Calculated',
      description: 'Application APP-20241201-ABC123 scored Grade B',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      user: 'John Analyst',
      status: 'success',
    },
    {
      id: '2',
      type: 'application_created',
      title: 'New Application Submitted',
      description: 'Rahman Grocery Shop - Loan amount: ৳500,000',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      user: 'Sarah Officer',
      status: 'success',
    },
    {
      id: '3',
      type: 'report_generated',
      title: 'Report Generated',
      description: 'Monthly risk assessment report completed',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
      user: 'System',
      status: 'success',
    },
  ];

  const displayActivities = activities.length > 0 ? activities : mockActivities;

  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'application_created':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'score_calculated':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'report_generated':
        return <FileText className="h-4 w-4 text-purple-600" />;
      case 'user_login':
        return <User className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        {displayActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.title}
                    </p>
                    {activity.status && (
                      <StatusBadge status={activity.status as any} />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate">
                    {activity.description}
                  </p>
                  
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <User className="h-3 w-3 mr-1" />
                    <span>{activity.user}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                  </div>
                </div>
              </div>
            ))}
            
            {displayActivities.length > 5 && (
              <div className="text-center pt-4">
                <Button variant="ghost" size="sm">
                  View All Activity
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};