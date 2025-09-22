'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, ScatterChart, Scatter, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Award, AlertCircle, CheckCircle, Target } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  source: string;
  aiScore: number;
  humanScore: number;
  dateAdded: string;
  status: string;
  passedAiFilter: boolean;
  passedHumanFilter: boolean;
}

interface WeeklyTrend {
  week: string;
  totalCandidates: number;
  averageDiscrepancy: number;
  aiAccuracy: number;
  [key: string]: any;
}

interface CandidateQualityTabProps {
  candidates: Candidate[];
  weeklyTrends: WeeklyTrend[];
}

/**
 * Candidate Quality tab showing quality trends and improvements over time
 */
export function CandidateQualityTab({ candidates, weeklyTrends }: CandidateQualityTabProps) {
  // Calculate quality metrics over time
  const qualityTrends = weeklyTrends.map(week => {
    const weekCandidates = candidates.filter(candidate => {
      if (!candidate.dateAdded) return false;
      try {
        const candidateDate = new Date(candidate.dateAdded);
        const weekDate = new Date(week.week);
        const weekEnd = new Date(weekDate);
        weekEnd.setDate(weekEnd.getDate() + 7);
        return candidateDate >= weekDate && candidateDate < weekEnd;
      } catch {
        return false;
      }
    });

    const totalCandidates = weekCandidates.length;
    const avgAiScore = totalCandidates > 0 
      ? weekCandidates.reduce((sum, c) => sum + (c.aiScore || 0), 0) / totalCandidates 
      : 0;
    
    const avgHumanScore = weekCandidates.filter(c => c.humanScore > 0).length > 0
      ? weekCandidates.filter(c => c.humanScore > 0).reduce((sum, c) => sum + c.humanScore, 0) / weekCandidates.filter(c => c.humanScore > 0).length
      : 0;

    const highQualityCandidates = weekCandidates.filter(c => c.aiScore >= 7).length;
    const passedAiFilter = weekCandidates.filter(c => c.passedAiFilter).length;
    const passedHumanFilter = weekCandidates.filter(c => c.passedHumanFilter).length;
    const bothFilters = weekCandidates.filter(c => c.passedAiFilter && c.passedHumanFilter).length;

    return {
      week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: week.week,
      totalCandidates,
      avgAiScore,
      avgHumanScore,
      highQualityCandidates,
      passedAiFilter,
      passedHumanFilter,
      bothFilters,
      qualityRate: totalCandidates > 0 ? (highQualityCandidates / totalCandidates * 100) : 0,
      aiFilterRate: totalCandidates > 0 ? (passedAiFilter / totalCandidates * 100) : 0,
      humanFilterRate: totalCandidates > 0 ? (passedHumanFilter / totalCandidates * 100) : 0,
      bothFiltersRate: totalCandidates > 0 ? (bothFilters / totalCandidates * 100) : 0,
    };
  });

  // Quality by role
  const roleQuality = candidates.reduce((acc: any, candidate) => {
    const role = candidate.jobRole || candidate.role || 'No Role';
    
    if (!acc[role]) {
      acc[role] = {
        role,
        totalCandidates: 0,
        aiScoreSum: 0,
        humanScoreSum: 0,
        aiScoreCount: 0,
        humanScoreCount: 0,
        highQuality: 0,
        passedAi: 0,
        passedHuman: 0,
        passedBoth: 0,
      };
    }
    
    acc[role].totalCandidates++;
    
    if (candidate.aiScore > 0) {
      acc[role].aiScoreSum += candidate.aiScore;
      acc[role].aiScoreCount++;
    }
    
    if (candidate.humanScore > 0) {
      acc[role].humanScoreSum += candidate.humanScore;
      acc[role].humanScoreCount++;
    }
    
    if (candidate.aiScore >= 7) acc[role].highQuality++;
    if (candidate.passedAiFilter) acc[role].passedAi++;
    if (candidate.passedHumanFilter) acc[role].passedHuman++;
    if (candidate.passedAiFilter && candidate.passedHumanFilter) acc[role].passedBoth++;
    
    return acc;
  }, {});

  const roleQualityData = Object.values(roleQuality).map((role: any) => ({
    ...role,
    avgAiScore: role.aiScoreCount > 0 ? role.aiScoreSum / role.aiScoreCount : 0,
    avgHumanScore: role.humanScoreCount > 0 ? role.humanScoreSum / role.humanScoreCount : 0,
    qualityRate: role.totalCandidates > 0 ? (role.highQuality / role.totalCandidates * 100) : 0,
    aiFilterRate: role.totalCandidates > 0 ? (role.passedAi / role.totalCandidates * 100) : 0,
    humanFilterRate: role.totalCandidates > 0 ? (role.passedHuman / role.totalCandidates * 100) : 0,
    bothFiltersRate: role.totalCandidates > 0 ? (role.passedBoth / role.totalCandidates * 100) : 0,
  }));

  // Calculate trends
  const getTrend = (data: number[]) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-2);
    const change = recent[1] - recent[0];
    if (Math.abs(change) < 0.1) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const aiScoreTrend = getTrend(qualityTrends.map(w => w.avgAiScore));
  const qualityRateTrend = getTrend(qualityTrends.map(w => w.qualityRate));
  const filterEfficiencyTrend = getTrend(qualityTrends.map(w => w.aiFilterRate));

  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />;
    }
  };

  // Current quality metrics
  const currentWeek = qualityTrends[qualityTrends.length - 1];
  const previousWeek = qualityTrends[qualityTrends.length - 2];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Candidate Quality</h2>
        <p className="text-gray-600">Quality trends, filtering effectiveness, and scoring calibration</p>
      </div>

      {/* Quality Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Award className="h-4 w-4 text-green-600" />
              <span>Avg AI Score</span>
              <TrendIcon trend={aiScoreTrend} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentWeek?.avgAiScore.toFixed(1) || '0.0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {previousWeek ? 
                `${(currentWeek?.avgAiScore - previousWeek?.avgAiScore || 0) > 0 ? '+' : ''}${(currentWeek?.avgAiScore - previousWeek?.avgAiScore || 0).toFixed(1)} from last week` : 
                'This week'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span>Quality Rate</span>
              <TrendIcon trend={qualityRateTrend} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentWeek?.qualityRate.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Candidates scoring 7+
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-purple-600" />
              <span>Filter Efficiency</span>
              <TrendIcon trend={filterEfficiencyTrend} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {currentWeek?.aiFilterRate.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Passed AI filter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span>Both Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {currentWeek?.bothFiltersRate.toFixed(1) || '0.0'}%
            </div>
            <p className="text-xs text-muted-foreground">
              Passed AI + Human
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quality Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Trends Over Time</CardTitle>
          <CardDescription>
            AI score trends and filtering effectiveness
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={qualityTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" domain={[0, 10]} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} />
              <Tooltip />
              <Line yAxisId="left" type="monotone" dataKey="avgAiScore" stroke="#10b981" strokeWidth={3} name="Avg AI Score" />
              <Line yAxisId="left" type="monotone" dataKey="avgHumanScore" stroke="#8b5cf6" strokeWidth={3} name="Avg Human Score" />
              <Line yAxisId="right" type="monotone" dataKey="qualityRate" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Quality Rate %" />
              <Line yAxisId="right" type="monotone" dataKey="aiFilterRate" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="AI Filter Rate %" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Role Quality Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Quality by Role</CardTitle>
          <CardDescription>
            Filtering effectiveness and score distribution by job role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Avg AI Score</th>
                  <th className="text-left p-3 font-medium">Avg Human Score</th>
                  <th className="text-left p-3 font-medium">Quality Rate</th>
                  <th className="text-left p-3 font-medium">AI Filter</th>
                  <th className="text-left p-3 font-medium">Human Filter</th>
                  <th className="text-left p-3 font-medium">Both Filters</th>
                </tr>
              </thead>
              <tbody>
                {roleQualityData.map((role: any) => (
                  <tr key={role.role} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{role.role}</td>
                    <td className="p-3">{role.totalCandidates}</td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        role.avgAiScore >= 7 ? 'text-green-600' :
                        role.avgAiScore >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {role.avgAiScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        role.avgHumanScore >= 7 ? 'text-green-600' :
                        role.avgHumanScore >= 5 ? 'text-yellow-600' : 
                        role.avgHumanScore > 0 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {role.avgHumanScore > 0 ? role.avgHumanScore.toFixed(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        role.qualityRate >= 20 ? 'text-green-600' :
                        role.qualityRate >= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {role.qualityRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-blue-600 font-medium">
                        {role.passedAi} ({role.aiFilterRate.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-purple-600 font-medium">
                        {role.passedHuman} ({role.humanFilterRate.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-green-600 font-medium">
                        {role.passedBoth} ({role.bothFiltersRate.toFixed(1)}%)
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quality Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quality Improvement Insights</CardTitle>
          <CardDescription>
            Analysis and recommendations for improving candidate quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">🎯 High Performing Roles</h4>
              <ul className="space-y-2">
                {roleQualityData
                  .filter((r: any) => r.avgAiScore >= 6)
                  .sort((a: any, b: any) => b.avgAiScore - a.avgAiScore)
                  .slice(0, 3)
                  .map((role: any, index) => (
                    <li key={role.role} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">
                        #{index + 1} {role.role}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {role.avgAiScore.toFixed(1)} avg
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-orange-600">⚠️ Needs Attention</h4>
              <ul className="space-y-2">
                {roleQualityData
                  .filter((r: any) => r.avgAiScore < 5 && r.totalCandidates >= 5)
                  .map((role: any) => (
                    <li key={role.role} className="flex items-center justify-between p-2 bg-orange-50 rounded">
                      <span className="text-sm font-medium">{role.role}</span>
                      <span className="text-sm font-bold text-orange-600">
                        {role.avgAiScore.toFixed(1)} avg
                      </span>
                    </li>
                  ))}
                {roleQualityData.filter((r: any) => r.avgAiScore < 5 && r.totalCandidates >= 5).length === 0 && (
                  <li className="text-gray-500 text-sm">All roles performing well! 🎉</li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-blue-600">📊 Key Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Quality Rate:</span>
                  <span className="font-medium text-blue-600">
                    {currentWeek?.qualityRate.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>AI Filter Efficiency:</span>
                  <span className="font-medium text-green-600">
                    {currentWeek?.aiFilterRate.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Both Filters Rate:</span>
                  <span className="font-medium text-purple-600">
                    {currentWeek?.bothFiltersRate.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="pt-2 border-t text-xs text-gray-600">
                  Trends: AI Score {aiScoreTrend}, Quality {qualityRateTrend}, Filter {filterEfficiencyTrend}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h5 className="font-medium text-blue-800 mb-2">💡 Quality Improvement Recommendations</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Focus on roles with quality rates above 20% for optimal ROI</li>
              <li>• Investigate sourcing strategies for roles with low AI scores</li>
              <li>• Calibrate AI prompts for roles showing high AI-Human discrepancy</li>
              <li>• Consider additional screening for roles with low filter pass rates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
