import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';

interface RiskDistributionData {
  risk: string;
  count: number;
  percentage: number;
}

interface RiskDistributionChartProps {
  data: RiskDistributionData[];
  loading?: boolean;
}

const RISK_COLORS = {
  'LOW': '#10B981',
  'MEDIUM': '#F59E0B',
  'HIGH': '#F97316',
  'VERY HIGH': '#EF4444',
};

export const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{label} Risk</p>
          <p className="text-sm text-gray-600">
            Count: {data.count} ({data.percentage.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="risk" />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" fill="#8884d8">
              {data.map((entry, index) => (
                <Bar key={`bar-${index}`} fill={RISK_COLORS[entry.risk as keyof typeof RISK_COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};