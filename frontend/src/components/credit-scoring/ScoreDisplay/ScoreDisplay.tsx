// src/components/credit-scoring/ScoreDisplay/ScoreDisplay.tsx
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Progress,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Alert,
  AlertDescription,
  Separator,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Eye,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Target,
  Shield,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
import type { CreditScore, ScoreDisplayProps } from '../../../types/scoring';

// Color schemes for different grade levels
const gradeColors = {
  A: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', accent: '#10B981' },
  B: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', accent: '#3B82F6' },
  C: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', accent: '#F59E0B' },
  R: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', accent: '#EF4444' },
};

const riskColors = {
  low: '#10B981',
  medium: '#F59E0B', 
  high: '#F97316',
  very_high: '#EF4444',
};

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({
  score,
  showDetails = true,
  compact = false,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState<string[]>([]);

  const gradeStyle = gradeColors[score.grade as keyof typeof gradeColors];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Prepare chart data
  const componentScoreData = [
    { name: 'Data Points', value: score.data_points_score, maxValue: 100, color: '#8B5CF6' },
    { name: 'Credit Ratios', value: score.credit_ratios_score, maxValue: 100, color: '#06B6D4' },
    { name: 'Borrower Attributes', value: score.borrower_attributes_score, maxValue: 100, color: '#84CC16' },
  ];

  if (score.psychometric_result) {
    componentScoreData.push({
      name: 'Psychometric',
      value: score.psychometric_result.total_score,
      maxValue: 100,
      color: '#F97316'
    });
  }

  const riskIndicatorData = [
    { name: 'Score', value: score.total_points, maxValue: 100, color: gradeStyle.accent }
  ];

  const ratioData = score.credit_ratios_breakdown.map(ratio => ({
    name: ratio.ratio_name.replace('_', ' ').toUpperCase(),
    value: ratio.score,
    band: ratio.band,
    color: ratio.band === 'green' ? '#10B981' : ratio.band === 'amber' ? '#F59E0B' : '#EF4444'
  }));

  if (compact) {
    return (
      <Card className={`${gradeStyle.bg} ${gradeStyle.border} border-l-4`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${gradeStyle.bg} ${gradeStyle.text}`}>
                  Grade {score.grade}
                </Badge>
                <Badge variant="outline">
                  {score.risk_level.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p className="text-2xl font-bold">{score.total_points.toFixed(1)}</p>
              <p className="text-sm text-gray-600">Final Score</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">{formatCurrency(score.max_loan_amount)}</p>
              <p className="text-sm text-gray-600">Max Loan Amount</p>
            </div>
          </div>
          {score.red_flags.length > 0 && (
            <div className="mt-3 flex items-center gap-1 text-orange-600">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm">{score.red_flags.length} risk flag(s)</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className={`${gradeStyle.bg} ${gradeStyle.border} border-l-4`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Credit Score Results
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Calculated on {formatDate(score.calculated_at)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Recalculate
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Final Score */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%" data={riskIndicatorData}>
                    <RadialBar dataKey="value" fill={gradeStyle.accent} />
                    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-current text-lg font-bold">
                      {score.total_points.toFixed(1)}
                    </text>
                  </RadialBarChart>
                </ResponsiveContainer>
              </div>
              <Badge className={`${gradeStyle.bg} ${gradeStyle.text} text-lg px-3 py-1`}>
                Grade {score.grade}
              </Badge>
              <p className="text-sm text-gray-600 mt-1">{score.loan_slab_adjustment}</p>
            </div>

            {/* Risk Assessment */}
            <div className="flex flex-col items-center">
              <Shield className="h-8 w-8 mb-2" style={{ color: riskColors[score.risk_level as keyof typeof riskColors] }} />
              <Badge 
                variant="outline" 
                className="mb-2"
                style={{ 
                  borderColor: riskColors[score.risk_level as keyof typeof riskColors],
                  color: riskColors[score.risk_level as keyof typeof riskColors]
                }}
              >
                {score.risk_level.replace('_', ' ').toUpperCase()} RISK
              </Badge>
              <p className="text-sm text-center">
                {(score.default_probability * 100).toFixed(1)}% Default Probability
              </p>
            </div>

            {/* Max Loan Amount */}
            <div className="flex flex-col items-center">
              <DollarSign className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-lg font-semibold text-green-600">
                {formatCurrency(score.max_loan_amount)}
              </p>
              <p className="text-sm text-gray-600 text-center">Maximum Loan Amount</p>
            </div>

            {/* Red Flags */}
            <div className="flex flex-col items-center">
              {score.red_flags.length === 0 ? (
                <>
                  <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                  <p className="text-sm text-green-600 text-center">No Risk Flags</p>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-8 w-8 text-orange-600 mb-2" />
                  <p className="text-sm text-orange-600 text-center">
                    {score.red_flags.length} Risk Flag(s)
                  </p>
                  <p className="text-xs text-gray-500">
                    {score.red_flags.filter(f => f.flag_type === 'critical').length} Critical
                    , {score.red_flags.filter(f => f.flag_type === 'warning').length} Warning
                    , {score.red_flags.filter(f => f.flag_type === 'info').length} Info
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Tabs for Details */}
      {showDetails && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="ratios">Credit Ratios</TabsTrigger>
            {score.psychometric_result && <TabsTrigger value="psychometric">Psychometric</TabsTrigger>}
            {score.red_flags.length > 0 && <TabsTrigger value="red_flags">Red Flags</TabsTrigger>}
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Final Score</p>
                    <p className="text-2xl font-bold">{score.total_points.toFixed(1)}</p>
                    <Badge className={`${gradeStyle.bg} ${gradeStyle.text} mt-1`}>
                      Grade {score.grade}
                    </Badge>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <Badge 
                      variant="outline" 
                      style={{ 
                        borderColor: riskColors[score.risk_level as keyof typeof riskColors],
                        color: riskColors[score.risk_level as keyof typeof riskColors]
                      }}
                      className="mt-1"
                    >
                      {score.risk_level.replace('_', ' ').toUpperCase()} RISK
                    </Badge>
                    <p className="text-sm text-gray-600 mt-1">
                      {(score.default_probability * 100).toFixed(1)}% Default Probability
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Max Loan Amount</p>
                    <p className="text-lg font-semibold text-green-600 mt-1">
                      {formatCurrency(score.max_loan_amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components">
            <Card>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={componentScoreData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {componentScoreData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Credit Ratios Tab */}
          <TabsContent value="ratios">
            <Card>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={ratioData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8">
                      {ratioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          {/* Psychometric Tab */}
          {score.psychometric_result && (
            <TabsContent value="psychometric">
              <Card>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Psychometric Score</p>
                      <p className="text-2xl font-bold">{score.psychometric_result.total_score.toFixed(1)}</p>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {score.psychometric_result.trait_scores.map((trait, idx) => (
                        <div key={idx} className="text-center">
                          <p className="text-sm text-gray-600">{trait.trait_name.replace('_', ' ').toUpperCase()}</p>
                          <p className="text-xl font-semibold">{trait.score.toFixed(1)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {/* Red Flags Tab */}
          {score.red_flags.length > 0 && (
            <TabsContent value="red_flags">
              <div className="space-y-4">
                {score.red_flags.map((flag, idx) => {
                  const flagColor = flag.flag_type === 'critical' ? 'text-red-600' : flag.flag_type === 'warning' ? 'text-orange-600' : 'text-blue-600';
                  const FlagIcon = flag.flag_type === 'critical' ? XCircle : flag.flag_type === 'warning' ? AlertTriangle : Info;
                  return (
                    <Alert key={idx} className={`${flagColor} border-l-4`}>
                      <FlagIcon className="h-5 w-5 flex-shrink-0" />
                      <AlertDescription>
                        <p className="font-semibold">{flag.title}</p>
                        <p className="text-sm">{flag.description}</p>
                      </AlertDescription>
                    </Alert>
                  );
                })}
              </div>
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
export default ScoreDisplay;