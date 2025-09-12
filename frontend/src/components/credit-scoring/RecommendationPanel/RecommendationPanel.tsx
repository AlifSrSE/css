import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Lightbulb, 
  TrendingUp, 
  DollarSign,
  Clock,
  Shield,
  Target,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { Button } from '../../common/Forms/Button';
import { StatusBadge } from '../../common/Tables/StatusBadge';
import { cn } from '../../../utils/cn';
import type { CreditScore } from '../../../types/scoring';

interface RecommendationPanelProps {
  score: CreditScore;
  className?: string;
  onAcceptRecommendation?: (recommendationId: string) => void;
  onRejectRecommendation?: (recommendationId: string) => void;
}

interface RecommendationItem {
  id: string;
  type: 'approval' | 'terms' | 'monitoring' | 'enhancement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  impact: string;
  implementation: string;
  accepted?: boolean;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  score,
  className,
  onAcceptRecommendation,
  onRejectRecommendation,
}) => {
  const [acceptedRecommendations, setAcceptedRecommendations] = useState<Set<string>>(new Set());
  const [rejectedRecommendations, setRejectedRecommendations] = useState<Set<string>>(new Set());

  const handleAccept = (id: string) => {
    setAcceptedRecommendations(prev => new Set(prev).add(id));
    onAcceptRecommendation?.(id);
  };

  const handleReject = (id: string) => {
    setRejectedRecommendations(prev => new Set(prev).add(id));
    onRejectRecommendation?.(id);
  };

  // Generate recommendations based on score
  const generateRecommendations = (): RecommendationItem[] => {
    const recommendations: RecommendationItem[] = [];

    // Grade-based approval recommendations
    if (score.grade === 'A') {
      recommendations.push({
        id: 'grade-a-approval',
        type: 'approval',
        title: 'Approve with Premium Terms',
        description: 'Excellent credit profile qualifies for best available terms and increased loan limits.',
        priority: 'high',
        impact: 'Positive customer experience, competitive advantage',
        implementation: 'Process immediately with reduced documentation requirements'
      });

      recommendations.push({
        id: 'grade-a-upsell',
        type: 'enhancement',
        title: 'Offer Additional Financial Products',
        description: 'High-quality borrower suitable for cross-selling opportunities.',
        priority: 'medium',
        impact: 'Increased revenue potential and customer relationship depth',
        implementation: 'Present additional product options during loan processing'
      });
    }

    if (score.grade === 'B') {
      recommendations.push({
        id: 'grade-b-approval',
        type: 'approval',
        title: 'Approve with Standard Terms',
        description: 'Good credit profile suitable for standard loan processing.',
        priority: 'high',
        impact: 'Balanced risk-return profile',
        implementation: 'Process with standard documentation and verification'
      });
    }

    if (score.grade === 'C') {
      recommendations.push({
        id: 'grade-c-conditional',
        type: 'terms',
        title: 'Conditional Approval with Enhanced Terms',
        description: 'Require additional collateral or guarantor for risk mitigation.',
        priority: 'high',
        impact: 'Reduced risk exposure while maintaining business opportunity',
        implementation: 'Negotiate additional security before final approval'
      });

      recommendations.push({
        id: 'grade-c-monitoring',
        type: 'monitoring',
        title: 'Implement Enhanced Monitoring',
        description: 'Establish monthly check-ins and performance tracking.',
        priority: 'high',
        impact: 'Early detection of potential issues',
        implementation: 'Set up automated alerts and regular review schedule'
      });
    }

    if (score.grade === 'R') {
      recommendations.push({
        id: 'grade-r-rejection',
        type: 'approval',
        title: 'Decline Application',
        description: 'Risk profile exceeds acceptable thresholds for current loan products.',
        priority: 'high',
        impact: 'Protects portfolio quality and profitability',
        implementation: 'Communicate decision with improvement suggestions'
      });

      recommendations.push({
        id: 'grade-r-alternative',
        type: 'enhancement',
        title: 'Suggest Alternative Solutions',
        description: 'Offer financial counseling or alternative products if available.',
        priority: 'medium',
        impact: 'Maintains customer relationship and future opportunity',
        implementation: 'Provide referrals to business development or financial education programs'
      });
    }

    // Risk-based recommendations
    if (score.risk_level === 'high' || score.risk_level === 'very_high') {
      recommendations.push({
        id: 'high-risk-mitigation',
        type: 'terms',
        title: 'Implement Risk Mitigation Measures',
        description: 'Require additional documentation, collateral, or co-signers.',
        priority: 'high',
        impact: 'Reduces potential losses while enabling business',
        implementation: 'Document specific requirements before proceeding'
      });
    }

    // Ratio-based recommendations
    const redRatios = score.credit_ratios_breakdown.filter(ratio => ratio.band === 'red');
    if (redRatios.length > 0) {
      recommendations.push({
        id: 'ratio-improvement',
        type: 'monitoring',
        title: 'Monitor Financial Ratio Improvements',
        description: `${redRatios.length} financial ratios are below acceptable thresholds.`,
        priority: 'medium',
        impact: 'Improved financial health over time',
        implementation: 'Establish ratio improvement targets and review quarterly'
      });
    }

    // Loan amount recommendations
    if (score.max_loan_amount > 0) {
      const requestedAmount = 500000; // This would come from application data
      if (score.max_loan_amount < requestedAmount) {
        recommendations.push({
          id: 'amount-adjustment',
          type: 'terms',
          title: 'Adjust Loan Amount',
          description: `Recommend loan amount of ${score.max_loan_amount.toLocaleString()} BDT based on risk assessment.`,
          priority: 'high',
          impact: 'Aligns loan size with repayment capacity',
          implementation: 'Present counter-offer with justification'
        });
      }
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  const getRecommendationIcon = (type: RecommendationItem['type']) => {
    switch (type) {
      case 'approval': return <CheckCircle className="h-5 w-5" />;
      case 'terms': return <DollarSign className="h-5 w-5" />;
      case 'monitoring': return <Shield className="h-5 w-5" />;
      case 'enhancement': return <TrendingUp className="h-5 w-5" />;
      default: return <Lightbulb className="h-5 w-5" />;
    }
  };

  const getPriorityColor = (priority: RecommendationItem['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeColor = (type: RecommendationItem['type']) => {
    switch (type) {
      case 'approval': return 'text-green-600';
      case 'terms': return 'text-blue-600';
      case 'monitoring': return 'text-orange-600';
      case 'enhancement': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-600" />
            Recommendations Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {recommendations.length}
              </div>
              <p className="text-sm text-gray-600">Total Recommendations</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {recommendations.filter(r => r.priority === 'high').length}
              </div>
              <p className="text-sm text-gray-600">High Priority</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {acceptedRecommendations.size}
              </div>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {recommendations.length - acceptedRecommendations.size - rejectedRecommendations.size}
              </div>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((recommendation) => {
          const isAccepted = acceptedRecommendations.has(recommendation.id);
          const isRejected = rejectedRecommendations.has(recommendation.id);
          const isPending = !isAccepted && !isRejected;

          return (
            <Card 
              key={recommendation.id}
              className={cn(
                'transition-all duration-200',
                isAccepted && 'border-green-200 bg-green-50',
                isRejected && 'border-red-200 bg-red-50 opacity-75',
                isPending && 'hover:shadow-md'
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className={getTypeColor(recommendation.type)}>
                        {getRecommendationIcon(recommendation.type)}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {recommendation.title}
                      </h3>
                      <span className={cn('text-xs px-2 py-1 rounded-full font-medium uppercase',
                        recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                        recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      )}>
                        {recommendation.priority}
                      </span>
                      
                      {isAccepted && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {isRejected && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>

                    <p className="text-gray-700 mb-4">{recommendation.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-900">Impact:</strong>
                        <p className="text-gray-600 mt-1">{recommendation.impact}</p>
                      </div>
                      <div>
                        <strong className="text-gray-900">Implementation:</strong>
                        <p className="text-gray-600 mt-1">{recommendation.implementation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex flex-col gap-2">
                    {isPending && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAccept(recommendation.id)}
                          className="min-w-[100px]"
                        >
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReject(recommendation.id)}
                          className="min-w-[100px]"
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    
                    {isAccepted && (
                      <div className="text-center">
                        <span className="text-sm text-green-600 font-medium">Accepted</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setAcceptedRecommendations(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(recommendation.id);
                            return newSet;
                          })}
                          className="mt-1"
                        >
                          Undo
                        </Button>
                      </div>
                    )}
                    
                    {isRejected && (
                      <div className="text-center">
                        <span className="text-sm text-red-600 font-medium">Rejected</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setRejectedRecommendations(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(recommendation.id);
                            return newSet;
                          })}
                          className="mt-1"
                        >
                          Undo
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Action Summary */}
      {(acceptedRecommendations.size > 0 || rejectedRecommendations.size > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Action Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {acceptedRecommendations.size > 0 && (
                <div>
                  <h4 className="font-medium text-green-900 mb-2">Accepted Recommendations:</h4>
                  <ul className="space-y-1">
                    {recommendations
                      .filter(r => acceptedRecommendations.has(r.id))
                      .map(r => (
                        <li key={r.id} className="text-sm text-green-800 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {r.title}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t">
                <Button className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Generate Action Plan
                </Button>
                
                <Button variant="outline" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Schedule Follow-up
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};