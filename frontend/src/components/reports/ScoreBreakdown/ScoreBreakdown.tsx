import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { StatusBadge } from '../../common/Tables/StatusBadge';
import { Button } from '../../common/Forms/Button';
import { Eye, Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { useGetScoreBreakdownQuery } from '../../../store/api/reportsApi';
import { cn } from '../../../utils/cn';

interface ScoreBreakdownProps {
  applicationId: string;
  className?: string;
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ applicationId, className }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'comparison'>('overview');
  
  const { data: breakdown, isLoading, error } = useGetScoreBreakdownQuery(applicationId);

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !breakdown) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load score breakdown</p>
        </CardContent>
      </Card>
    );
  }

  const componentData = [
    {
      name: 'Data Points',
      score: breakdown.component_scores.data_points.score,
      percentage: breakdown.component_scores.data_points.percentage,
      color: '#8B5CF6'
    },
    {
      name: 'Credit Ratios',
      score: breakdown.component_scores.credit_ratios.score,
      percentage: breakdown.component_scores.credit_ratios.percentage,
      color: '#06B6D4'
    },
    {
      name: '5C Attributes',
      score: breakdown.component_scores.borrower_attributes.score,
      percentage: breakdown.component_scores.borrower_attributes.percentage,
      color: '#84CC16'
    }
  ];

  if (breakdown.component_scores.psychometric) {
    componentData.push({
      name: 'Psychometric',
      score: breakdown.component_scores.psychometric.score,
      percentage: breakdown.component_scores.psychometric.adjustment,
      color: '#F97316'
    });
  }

  const ratiosData = breakdown.component_scores.credit_ratios.ratios.map(ratio => ({
    name: ratio.name.replace('_', ' ').toUpperCase(),
    value: ratio.value,
    score: ratio.score,
    band: ratio.band,
    color: ratio.band === 'green' ? '#10B981' : ratio.band === 'amber' ? '#F59E0B' : '#EF4444'
  }));

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Score Breakdown Report</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Application: {breakdown.application_id}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={breakdown.grade as any} />
              <Button size="sm" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {breakdown.final_score.toFixed(1)}
              </div>
              <p className="text-sm text-gray-600">Final Score</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                Grade {breakdown.grade}
              </div>
              <p className="text-sm text-gray-600">Credit Grade</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {breakdown.risk_assessment.level.replace('_', ' ').toUpperCase()}
              </div>
              <p className="text-sm text-gray-600">Risk Level</p>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {(breakdown.risk_assessment.probability * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600">Default Risk</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className="flex space-x-1">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'components', label: 'Component Analysis' },
          { key: 'comparison', label: 'Peer Comparison' },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab.key as any)}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Component Scores Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Score Components</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={componentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${value}${name === 'score' ? '' : '%'}`, 
                      name === 'score' ? 'Score' : 'Weight'
                    ]}
                  />
                  <Bar dataKey="score" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Score Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={componentData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  >
                    {componentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'components' && (
        <div className="space-y-6">
          {/* Credit Ratios Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Credit Ratios Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={ratiosData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="score" fill="#8884d8">
                    {ratiosData.map((entry: { color: string }, index: number) => (
                        <Bar key={`bar-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              
              {/* Ratios Detail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {breakdown.component_scores.credit_ratios.ratios.map((ratio: any, index: any) => (
                  <div key={index} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium capitalize">
                        {ratio.name.replace('_', ' ')}
                      </h4>
                      <StatusBadge 
                        status={ratio.band as any}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-2 text-sm">
                      <span>Value: {ratio.value.toFixed(2)}%</span>
                      <span>Score: {ratio.score}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 5C Attributes Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>5C Attributes Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Object.entries(breakdown.component_scores.borrower_attributes.components).map(([category, data]: [string, any]) => (
                  <div key={category} className="text-center p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium mb-2 capitalize">{category}</h4>
                    <div className="text-2xl font-bold text-green-600">{data.score}</div>
                    <div className="text-sm text-gray-600">/{data.max_score}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      {((data.score / data.max_score) * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Psychometric Results */}
          {breakdown.component_scores.psychometric && (
            <Card>
              <CardHeader>
                <CardTitle>Psychometric Assessment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {Object.entries(breakdown.component_scores.psychometric.profile).map(([dimension, score]: [string, any]) => (
                    <div key={dimension} className="text-center p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-medium mb-2 capitalize">{dimension.replace('_', ' ')}</h4>
                      <div className="text-xl font-bold text-blue-600">{score}/20</div>
                      <div className="text-xs text-blue-600 mt-1">
                        {((score / 20) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Overall Score:</strong> {breakdown.component_scores.psychometric.score}/100
                    <span className="ml-4">
                      <strong>Adjustment:</strong> {breakdown.component_scores.psychometric.adjustment > 0 ? '+' : ''}{breakdown.component_scores.psychometric.adjustment} points
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'comparison' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Peer Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Peer comparison data will be available soon</p>
              <p className="text-sm">Compare this application with similar business types and loan amounts</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Assessment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Risk Factors</h4>
              {breakdown.risk_assessment.factors.length === 0 ? (
                <p className="text-green-600 text-sm">No significant risk factors identified</p>
              ) : (
                <div className="space-y-2">
                  {breakdown.risk_assessment.factors.map((factor: any, index: any) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span>{factor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Recommendations</h4>
              <div className="space-y-2">
                {breakdown.recommendations.map((recommendation: any, index: any) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{recommendation}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};