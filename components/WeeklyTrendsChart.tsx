'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WeeklyTrend {
  week: string;
  date: Date;
  totalCandidates: number;
  averageDiscrepancy: number;
  averageAbsoluteDiscrepancy: number;
  aiHigherCount: number;
  humanHigherCount: number;
  equalCount: number;
  maxDiscrepancy: number;
  minDiscrepancy: number;
  aiAccuracy: number;
}

interface WeeklyTrendsChartProps {
  weeklyTrends: WeeklyTrend[];
}

/**
 * Component to visualize week-over-week improvements in AI vs Human score alignment
 */
export function WeeklyTrendsChart({ weeklyTrends }: WeeklyTrendsChartProps) {
  if (!weeklyTrends || weeklyTrends.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Trends</CardTitle>
          <CardDescription>No weekly trend data available</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Need more data with dates to show weekly trends.</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for charts
  const chartData = weeklyTrends.map(trend => ({
    week: new Date(trend.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    fullDate: trend.week,
    averageDiscrepancy: Number(trend.averageDiscrepancy.toFixed(2)),
    absoluteDiscrepancy: Number(trend.averageAbsoluteDiscrepancy.toFixed(2)),
    aiAccuracy: Number(trend.aiAccuracy.toFixed(1)),
    totalCandidates: trend.totalCandidates,
  }));

  // Calculate trend direction for key metrics
  const getTrendDirection = (data: number[]) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-3); // Last 3 weeks
    const older = data.slice(-6, -3); // Previous 3 weeks
    
    if (recent.length === 0 || older.length === 0) return 'stable';
    
    const recentAvg = recent.reduce((sum, val) => sum + val, 0) / recent.length;
    const olderAvg = older.reduce((sum, val) => sum + val, 0) / older.length;
    
    const change = recentAvg - olderAvg;
    if (Math.abs(change) < 0.1) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const accuracyTrend = getTrendDirection(chartData.map(d => d.aiAccuracy));
  const discrepancyTrend = getTrendDirection(chartData.map(d => d.absoluteDiscrepancy));
  const volumeTrend = getTrendDirection(chartData.map(d => d.totalCandidates));

  // Calculate improvement metrics
  const latestWeek = chartData[chartData.length - 1];
  const firstWeek = chartData[0];
  const overallImprovement = {
    accuracy: latestWeek && firstWeek ? latestWeek.aiAccuracy - firstWeek.aiAccuracy : 0,
    discrepancy: latestWeek && firstWeek ? firstWeek.absoluteDiscrepancy - latestWeek.absoluteDiscrepancy : 0,
    volume: latestWeek && firstWeek ? latestWeek.totalCandidates - firstWeek.totalCandidates : 0,
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">Week of {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
              {entry.dataKey === 'aiAccuracy' ? '%' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* AI Accuracy Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">AI Accuracy Over Time</CardTitle>
            <div className="flex items-center space-x-1">
              <TrendIcon trend={accuracyTrend} />
              <span className="text-sm text-gray-600">
                {accuracyTrend === 'up' ? 'Improving' : accuracyTrend === 'down' ? 'Declining' : 'Stable'}
              </span>
            </div>
          </div>
          <CardDescription>
            Percentage of candidates where AI score is within 1 point of human score
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="aiAccuracy" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.3}
                name="AI Accuracy"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Score Discrepancy Trend */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Score Discrepancy Trend</CardTitle>
            <div className="flex items-center space-x-1">
              <TrendIcon trend={discrepancyTrend === 'down' ? 'up' : discrepancyTrend === 'up' ? 'down' : 'stable'} />
              <span className="text-sm text-gray-600">
                {discrepancyTrend === 'down' ? 'Improving' : discrepancyTrend === 'up' ? 'Worsening' : 'Stable'}
              </span>
            </div>
          </div>
          <CardDescription>
            Average absolute difference between AI and Human scores (lower is better)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="absoluteDiscrepancy" 
                stroke="#3b82f6" 
                strokeWidth={3}
                name="Avg Absolute Discrepancy"
              />
              <Line 
                type="monotone" 
                dataKey="averageDiscrepancy" 
                stroke="#ef4444" 
                strokeWidth={2}
                strokeDasharray="5 5"
                name="Avg Discrepancy (AI - Human)"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Weekly Performance Summary</CardTitle>
          <CardDescription>
            Key metrics for each week showing AI evaluation improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Week</th>
                  <th className="text-left p-2">Candidates</th>
                  <th className="text-left p-2">AI Accuracy</th>
                  <th className="text-left p-2">Avg Discrepancy</th>
                  <th className="text-left p-2">AI Higher</th>
                  <th className="text-left p-2">Human Higher</th>
                  <th className="text-left p-2">Equal</th>
                </tr>
              </thead>
              <tbody>
                {weeklyTrends.slice(-8).reverse().map((trend) => (
                  <tr key={trend.week} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">
                      {new Date(trend.week).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: '2-digit'
                      })}
                    </td>
                    <td className="p-2">{trend.totalCandidates}</td>
                    <td className="p-2">
                      <span className={`font-medium ${
                        trend.aiAccuracy >= 70 ? 'text-green-600' : 
                        trend.aiAccuracy >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {trend.aiAccuracy.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`${
                        Math.abs(trend.averageDiscrepancy) <= 0.5 ? 'text-green-600' : 
                        Math.abs(trend.averageDiscrepancy) <= 1 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {trend.averageDiscrepancy > 0 ? '+' : ''}{trend.averageDiscrepancy.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-2 text-red-600">{trend.aiHigherCount}</td>
                    <td className="p-2 text-blue-600">{trend.humanHigherCount}</td>
                    <td className="p-2 text-green-600">{trend.equalCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
