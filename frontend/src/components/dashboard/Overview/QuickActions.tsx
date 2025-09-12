import React from 'react';
import { Plus, FileText, BarChart3, Download, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { Button } from '../../common/Forms/Button';
import { useNavigate } from 'react-router-dom';

export const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'New Application',
      description: 'Create a new credit application',
      icon: <Plus className="h-5 w-5" />,
      onClick: () => navigate('/credit-scoring/new'),
      variant: 'default' as const,
    },
    {
      title: 'Generate Report',
      description: 'Create credit scoring report',
      icon: <BarChart3 className="h-5 w-5" />,
      onClick: () => navigate('/reports/generate'),
      variant: 'outline' as const,
    },
    {
      title: 'View Applications',
      description: 'Browse all applications',
      icon: <FileText className="h-5 w-5" />,
      onClick: () => navigate('/credit-scoring'),
      variant: 'outline' as const,
    },
    {
      title: 'Export Data',
      description: 'Download application data',
      icon: <Download className="h-5 w-5" />,
      onClick: () => {}, // Handle export
      variant: 'outline' as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto p-4 flex flex-col items-start justify-start text-left"
              onClick={action.onClick}
            >
              <div className="flex items-center gap-2 mb-1">
                {action.icon}
                <span className="font-medium">{action.title}</span>
              </div>
              <span className="text-xs opacity-75">{action.description}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};