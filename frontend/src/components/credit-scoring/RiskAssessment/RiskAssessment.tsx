import React, { useState } from 'react';
import { AlertTriangle, Shield, TrendingUp, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { Button } from '../../common/Forms/Button';
import { StatusBadge } from '../../common/Tables/StatusBadge';
import { cn } from '../../../utils/cn';
import type { CreditScore, RedFlag } from '../../../types/scoring';

interface RiskAssessmentProps {
  score: CreditScore;
  className?: string;
  onMitigationAction?: (action: string, flagId: string) => void;
}

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({
  score,
  className,
  onMitigationAction,
}) => {
  const [expandedFlags, setExpandedFlags] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'flags' | 'mitigation'>('overview');

  const toggleFlag = (flagName: string) => {
    setExpandedFlags(prev =>
      prev.includes(flagName)
        ? prev.filter(f => f !== flagName)
        : [...prev, flagName]
    );
  };

  const getRiskColor = (level: string) => {
    const colors = {
      low: 'text-green-600',
      medium: 'text-yellow-600', 
      high: 'text-orange-600',
      very_high: 'text-red-600',
    };
    return colors[level as keyof typeof colors] || 'text-gray-600';
  };

  const getRiskIcon = (level: string) => {
    if (level === 'low') return <Shield className="h-6 w-6 text-green-600" />;
    if (level === 'medium') return <AlertTriangle className="h-6 w-6 text-yellow-600" />;
    return <AlertTriangle className="h-6 w-6 text-red-600" />;
  };

  const hardFlags = score.red_flags.filter(flag => flag.flag_type === 'hard');
  const softFlags = score.red_flags.filter(flag => flag.flag_type === 'soft');

  return (
    <div className={cn('space-y-6', className)}>
      {/* Risk Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Overall Risk Level */}
            <div className="text-center">
              {getRiskIcon(score.risk_level)}
              <h3 className={cn('text-lg font-semibold mt-2', getRiskColor(score.risk_level))}>
                {score.risk_level.replace('_', ' ').toUpperCase()} RISK
              </h3>
              <p className="text-sm text-gray-600 mt-1">Overall Assessment</p>
            </div>

            {/* Default Probability */}
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">
                {(score.default_probability * 100).toFixed(1)}%
              </div>
              <p className="text-sm text-gray-600 mt-1">Default Probability</p>
            </div>

            {/* Risk Flags Count */}
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">
                {score.red_flags.length}
              </div>
              <p className="text-sm text-gray-600 mt-1">Risk Flags</p>
              <div className="flex justify-center gap-2 mt-2">
                {hardFlags.length > 0 && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                    {hardFlags.length} Hard
                  </span>
                )}
                {softFlags.length > 0 && (
                  <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                    {softFlags.length} Soft
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Risk Level Description */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-2">Risk Level Implications:</h4>
            <p className="text-sm text-gray-700">
              {score.risk_level === 'low' && 
                'Low risk borrower with strong repayment capacity. Suitable for standard loan terms with minimal monitoring requirements.'
              }
              {score.risk_level === 'medium' && 
                'Medium risk borrower requiring regular monitoring. Standard loan terms with periodic review recommended.'
              }
              {score.risk_level === 'high' && 
                'High risk borrower requiring enhanced monitoring and stricter loan terms. Additional collateral or guarantor recommended.'
              }
              {score.risk_level === 'very_high' && 
                'Very high risk borrower. Loan approval not recommended unless significant risk mitigation measures are implemented.'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Risk Details Tabs */}
      <Card>
        <CardHeader>
          <div className="flex space-x-1">
            {[
              { key: 'overview', label: 'Risk Breakdown' },
              { key: 'flags', label: 'Risk Flags' },
              { key: 'mitigation', label: 'Mitigation' },
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
        </CardHeader>

        <CardContent>
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Risk Score Components */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Risk Factors</h4>
                  
                  {/* Credit Risk */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Credit Risk</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${Math.min(100, (score.credit_ratios_breakdown.filter(r => r.band === 'red').length / score.credit_ratios_breakdown.length) * 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">
                        {score.credit_ratios_breakdown.filter(r => r.band === 'red').length} red ratios
                      </span>
                    </div>
                  </div>

                  {/* Business Risk */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Business Risk</span>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={score.risk_level} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Performance Indicators</h4>
                  
                  {/* Data Points Performance */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">Data Points</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-purple-600">
                        {score.data_points_score}/100
                      </span>
                    </div>
                  </div>

                  {/* Borrower Attributes Performance */}
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <span className="text-sm font-medium">5C Attributes</span>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-semibold text-green-600">
                        {score.borrower_attributes_score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trend Analysis */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Risk Trend Analysis
                </h4>
                <p className="text-sm text-blue-800">
                  Based on the current risk profile, this borrower shows{' '}
                  {score.risk_level === 'low' ? 'stable' : 
                   score.risk_level === 'medium' ? 'manageable' : 'concerning'} risk characteristics.
                  Regular monitoring is {score.risk_level === 'low' ? 'minimal' : 
                   score.risk_level === 'medium' ? 'standard' : 'enhanced'} recommended.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'flags' && (
            <div className="space-y-4">
              {score.red_flags.length === 0 ? (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-900">No Risk Flags</h3>
                  <p className="text-green-700">This application has no identified risk flags.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Hard Flags */}
                  {hardFlags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Hard Risk Flags ({hardFlags.length})
                      </h4>
                      {hardFlags.map((flag, index) => (
                        <RiskFlagItem
                          key={`hard-${index}`}
                          flag={flag}
                          expanded={expandedFlags.includes(flag.flag_name)}
                          onToggle={() => toggleFlag(flag.flag_name)}
                          onAction={onMitigationAction}
                        />
                      ))}
                    </div>
                  )}

                  {/* Soft Flags */}
                  {softFlags.length > 0 && (
                    <div>
                      <h4 className="font-medium text-yellow-900 mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Soft Risk Flags ({softFlags.length})
                      </h4>
                      {softFlags.map((flag, index) => (
                        <RiskFlagItem
                          key={`soft-${index}`}
                          flag={flag}
                          expanded={expandedFlags.includes(flag.flag_name)}
                          onToggle={() => toggleFlag(flag.flag_name)}
                          onAction={onMitigationAction}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'mitigation' && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Recommended Risk Mitigation Strategies</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Immediate Actions */}
                <div className="space-y-3">
                  <h5 className="font-medium text-red-900">Immediate Actions Required</h5>
                  {hardFlags.length > 0 ? (
                    <div className="space-y-2">
                      {hardFlags.map((flag, index) => (
                        <div key={index} className="p-3 bg-red-50 border border-red-200 rounded">
                          <p className="text-sm font-medium text-red-900">{flag.flag_name}</p>
                          <p className="text-xs text-red-700 mt-1">{flag.impact}</p>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="mt-2"
                            onClick={() => onMitigationAction?.('address_hard_flag', flag.flag_name)}
                          >
                            Address Flag
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-green-700 bg-green-50 p-3 rounded">
                      No immediate actions required.
                    </p>
                  )}
                </div>

                {/* Monitoring Actions */}
                <div className="space-y-3">
                  <h5 className="font-medium text-yellow-900">Monitoring & Follow-up</h5>
                  <div className="space-y-2">
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <p className="text-sm font-medium text-yellow-900">
                        {score.risk_level === 'low' ? 'Quarterly Review' :
                         score.risk_level === 'medium' ? 'Monthly Review' :
                         'Weekly Review'}
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        Regular monitoring of payment behavior and business performance
                      </p>
                    </div>
                    
                    {softFlags.length > 0 && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm font-medium text-yellow-900">Address Soft Flags</p>
                        <p className="text-xs text-yellow-700 mt-1">
                          {softFlags.length} soft flag(s) require attention and improvement plans
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => onMitigationAction?.('create_improvement_plan', 'soft_flags')}
                        >
                          Create Improvement Plan
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Success Metrics */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h5 className="font-medium text-blue-900 mb-2">Success Metrics to Monitor</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Payment punctuality (target: 100% on-time payments)</li>
                  <li>• Business revenue stability (target: &lt;20% month-over-month variation)</li>
                  <li>• Debt service coverage ratio (target: &gt;1.25)</li>
                  <li>• Cash flow positive months (target: 100%)</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Risk Flag Item Component
interface RiskFlagItemProps {
  flag: RedFlag;
  expanded: boolean;
  onToggle: () => void;
  onAction?: (action: string, flagId: string) => void;
}

const RiskFlagItem: React.FC<RiskFlagItemProps> = ({ flag, expanded, onToggle, onAction }) => {
  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'border-yellow-200 bg-yellow-50',
      medium: 'border-orange-200 bg-orange-50',
      high: 'border-red-200 bg-red-50',
      critical: 'border-red-300 bg-red-100',
    };
    return colors[severity as keyof typeof colors] || 'border-gray-200 bg-gray-50';
  };

  const getSeverityTextColor = (severity: string) => {
    const colors = {
      low: 'text-yellow-900',
      medium: 'text-orange-900',
      high: 'text-red-900',
      critical: 'text-red-900',
    };
    return colors[severity as keyof typeof colors] || 'text-gray-900';
  };

  return (
    <div className={cn('border rounded-lg p-4', getSeverityColor(flag.severity))}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle 
            className={cn('h-5 w-5', 
              flag.severity === 'critical' ? 'text-red-600' :
              flag.severity === 'high' ? 'text-red-600' :
              flag.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
            )} 
          />
          <div>
            <h5 className={cn('font-medium', getSeverityTextColor(flag.severity))}>
              {flag.flag_name}
            </h5>
            <div className="flex items-center gap-2 mt-1">
              <span className={cn('text-xs px-2 py-1 rounded uppercase font-medium',
                flag.flag_type === 'hard' ? 'bg-red-200 text-red-800' : 'bg-yellow-200 text-yellow-800'
              )}>
                {flag.flag_type}
              </span>
              <span className={cn('text-xs px-2 py-1 rounded capitalize', getSeverityColor(flag.severity))}>
                {flag.severity}
              </span>
            </div>
          </div>
        </div>
        
        <Button variant="ghost" size="sm" onClick={onToggle}>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {expanded && (
        <div className="mt-4 space-y-3">
          <p className={cn('text-sm', getSeverityTextColor(flag.severity))}>
            <strong>Description:</strong> {flag.description}
          </p>
          <p className={cn('text-sm', getSeverityTextColor(flag.severity))}>
            <strong>Impact:</strong> {flag.impact}
          </p>
          
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAction?.('view_details', flag.flag_name)}
            >
              <Eye className="h-3 w-3 mr-1" />
              View Details
            </Button>
            
            {flag.flag_type === 'soft' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onAction?.('create_action_plan', flag.flag_name)}
              >
                Create Action Plan
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
