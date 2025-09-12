import React from 'react';
import { Lightbulb, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';

interface BusinessInsightsData {
  high_performing_sectors: string[];
  risk_concentrations: Record<string, number>;
  seasonal_patterns: Array<{
    month: string;
    trend: string;
    avg_score: number;
    applications: number;
  }>;
  recommendations: string[];
}

interface BusinessInsightsProps {
  data: BusinessInsightsData;
  loading?: boolean;
}

export const BusinessInsights: React.FC<BusinessInsightsProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Business Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'high': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'low': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Calendar className="h-4 w-4 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'high': return 'bg-green-50 border-green-200';
      case 'low': return 'bg-red-50 border-red-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* High Performing Sectors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            High Performing Sectors
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.high_performing_sectors.length === 0 ? (
            <p className="text-gray-600">No standout performing sectors identified in current data.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {data.high_performing_sectors.map((sector, index) => (
                <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="font-medium text-green-900">{sector}</div>
                  <p className="text-sm text-green-700">Strong performance metrics</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Concentrations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Risk Concentrations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(data.risk_concentrations).length === 0 ? (
            <p className="text-gray-600">No significant risk concentrations detected.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(data.risk_concentrations).map(([sector, percentage]) => (
                <div key={sector} className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <div className="font-medium text-orange-900">{sector}</div>
                    <p className="text-sm text-orange-700">High risk concentration</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-600">{percentage}%</div>
                    <p className="text-xs text-orange-600">Risk rate</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seasonal Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Seasonal Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {data.seasonal_patterns.map((pattern, index) => (
              <div key={index} className={`p-3 border rounded-lg ${getTrendColor(pattern.trend)}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{pattern.month}</span>
                  {getTrendIcon(pattern.trend)}
                </div>
                <div className="text-sm">
                  <div>Avg Score: {pattern.avg_score.toFixed(1)}</div>
                  <div>Apps: {pattern.applications}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            AI Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-yellow-900">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};