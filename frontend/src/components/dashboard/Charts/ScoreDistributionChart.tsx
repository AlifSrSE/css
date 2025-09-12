import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';

interface ScoreDistributionData {
  grade: string;
  count: number;
  percentage: number;
}

interface ScoreDistributionChartProps {
  data: ScoreDistributionData[];
  loading?: boolean;
}

const COLORS = {
  A: '#10B981', // Green
  B: '#3B82F6', // Blue
  C: '#F59E0B', // Yellow
  R: '#EF4444', // Red
};

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({
  data,
  loading = false,
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">Grade {data.grade}</p>
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
        <CardTitle>Grade Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ grade, percentage }) => `${grade}: ${percentage.toFixed(1)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.grade as keyof typeof COLORS]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend with stats */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item) => (
            <div key={item.grade} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: COLORS[item.grade as keyof typeof COLORS] }}
                />
                <span className="text-sm font-medium">Grade {item.grade}</span>
              </div>
              <span className="text-sm">{item.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};