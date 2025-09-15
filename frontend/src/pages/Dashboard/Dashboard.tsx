import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  FileText,
  BarChart3,
  Calendar,
  Filter,
  Download,
} from 'lucide-react';
import { useGetDashboardStatsQuery } from '../../store/api/scoringApi';
import { useGetAnalyticsQuery } from '../../store/api/analyticsApi';
import { useGetPerformanceMetricsQuery } from '../../store/api/analyticsApi';

const Dashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState('6m');
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fetch dashboard data
  const { data: dashboardStats, isLoading: statsLoading } = useGetDashboardStatsQuery({ date_range: dateRange });
  const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsQuery({
    date_from: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
    date_to: new Date().toISOString(),
  });
  const { data: performanceMetrics } = useGetPerformanceMetricsQuery({ period: dateRange });

  // Mock data for demonstration (replace with real data from API)
  const mockStats = {
    total_applications: 1247,
    pending_applications: 89,
    completed_applications: 1034,
    rejected_applications: 124,
    average_score: 67.8,
    grade_distribution: { A: 234, B: 456, C: 344, R: 213 },
    risk_distribution: { low: 345, medium: 489, high: 267, very_high: 146 },
    monthly_trends: [
      { month: 'Jan', applications: 98, avg_score: 65.2, approval_rate: 78 },
      { month: 'Feb', applications: 112, avg_score: 66.8, approval_rate: 81 },
      { month: 'Mar', applications: 134, avg_score: 68.1, approval_rate: 83 },
      { month: 'Apr', applications: 156, avg_score: 67.5, approval_rate: 79 },
      { month: 'May', applications: 189, avg_score: 69.2, approval_rate: 85 },
      { month: 'Jun', applications: 203, avg_score: 68.9, approval_rate: 82 },
    ],
  };

  const stats = dashboardStats || mockStats;

  // Prepare chart data
  const gradeData = Object.entries(stats.grade_distribution).map(([grade, count]) => ({
    grade,
    count,
    percentage: ((count as number) / stats.total_applications) * 100,
  }));

  const riskData = Object.entries(stats.risk_distribution).map(([risk, count]) => ({
    risk: risk.replace('_', ' ').toUpperCase(),
    count,
    percentage: ((count as number) / stats.total_applications) * 100,
  }));

  const COLORS = {
    A: '#10B981', // Green
    B: '#3B82F6', // Blue  
    C: '#F59E0B', // Yellow
    R: '#EF4444', // Red
    LOW: '#10B981',
    MEDIUM: '#F59E0B',
    HIGH: '#F97316',
    'VERY HIGH': '#EF4444',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('bn-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Credit Scoring Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor loan applications and scoring performance</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total_applications.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Score</p>
                <p className="text-3xl font-bold text-gray-900">{stats.average_score.toFixed(1)}</p>
              </div>
                <Users className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+3.2%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed_applications.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+8.7%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected Applications</p>
                <p className="text-3xl font-bold text-gray-900">{stats.rejected_applications.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
              <span className="text-red-600">-4.3%</span>
              <span className="text-gray-600 ml-1">from last month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Monthly Trends</CardTitle>
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm text-gray-600">Last 6 Months</span>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.monthly_trends} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="applications" stroke="#8884d8" activeDot={{ r: 8 }} name="Applications" />
                <Line yAxisId="right" type="monotone" dataKey="avg_score" stroke="#82ca9d" name="Avg. Score" />
                <Line yAxisId="right" type="monotone" dataKey="approval_rate" stroke="#ffc658" name="Approval Rate (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={gradeData}
                  dataKey="count"
                  nameKey="grade"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  label={({ grade, percentage }) => `${grade}: ${percentage.toFixed(1)}%`}
                >
                  {gradeData.map((entry) => (
                    <Cell key={`cell-${entry.grade}`} fill={COLORS[entry.grade as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskData}
                  dataKey="count"
                  nameKey="risk"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#82ca9d"
                  label={({ risk, percentage }) => `${risk}: ${percentage.toFixed(1)}%`}
                >
                  {riskData.map((entry) => (
                    <Cell key={`cell-${entry.risk}`} fill={COLORS[entry.risk as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      {/* Performance Metrics */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Performance Metrics</CardTitle>
          <Tabs value={selectedFilter} onValueChange={setSelectedFilter}>
            <TabsList>
              <TabsTrigger value="all" className="text-sm">
                All
              </TabsTrigger>
              <TabsTrigger value="low" className="text-sm">
                Low Risk
              </TabsTrigger>
              <TabsTrigger value="medium" className="text-sm">
                Medium Risk
              </TabsTrigger>
              <TabsTrigger value="high" className="text-sm">
                High Risk
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {performanceMetrics ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">Model Accuracy</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{(performanceMetrics.model_accuracy * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600 mt-1">Overall model accuracy</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">False Positive Rate</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{(performanceMetrics.false_positive_rate * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600 mt-1">Rate of false positives</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium text-gray-900">False Negative Rate</h3>
                <p className="text-2xl font-bold text-gray-900 mt-2">{(performanceMetrics.false_negative_rate * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600 mt-1">Rate of false negatives</p>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-600">No performance metrics available.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
export default Dashboard;