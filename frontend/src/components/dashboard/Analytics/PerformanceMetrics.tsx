import React from 'react';
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { cn } from '../../../utils/cn';

interface PerformanceData {
  model_accuracy: number;
  precision_by_grade: Record<string, number>;
  recall_by_grade: Record<string, number>;
  false_positive_rate: number;
  false_negative_rate: number;
}

interface PerformanceMetricsProps {
  data: PerformanceData;
  loading?: boolean;
}

export const PerformanceMetrics: React.FC<PerformanceMetricsProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Model Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getMetricStatus = (value: number, threshold: number = 0.8) => {
    if (value >= threshold) return 'excellent';
    if (value >= threshold - 0.1) return 'good';
    if (value >= threshold - 0.2) return 'fair';
    return 'poor';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'fair': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'poor': return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default: return <Target className="h-5 w-5 text-gray-600" />;
    }
  };

  const accuracyStatus = getMetricStatus(data.model_accuracy);

  return (
    <div className="space-y-6">
      {/* Overall Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Model Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getStatusIcon(accuracyStatus)}
              </div>
              <div className={cn('text-3xl font-bold', getStatusColor(accuracyStatus))}>
                {(data.model_accuracy * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Overall Accuracy</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {(data.false_positive_rate * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">False Positive Rate</p>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {(data.false_negative_rate * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">False Negative Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Grade-wise Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance by Grade</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(data.precision_by_grade).map(([grade, precision]) => {
              const recall = data.recall_by_grade[grade];
              const f1Score = (2 * precision * recall) / (precision + recall);
              
              return (
                <div key={grade} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-white font-medium',
                      grade === 'A' ? 'bg-green-600' :
                      grade === 'B' ? 'bg-blue-600' :
                      grade === 'C' ? 'bg-yellow-600' : 'bg-red-600'
                    )}>
                      {grade}
                    </div>
                    <span className="font-medium">Grade {grade}</span>
                  </div>
                  
                  <div className="flex gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-semibold">{(precision * 100).toFixed(1)}%</div>
                      <div className="text-gray-600">Precision</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{(recall * 100).toFixed(1)}%</div>
                      <div className="text-gray-600">Recall</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold">{(f1Score * 100).toFixed(1)}%</div>
                      <div className="text-gray-600">F1-Score</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};