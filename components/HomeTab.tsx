'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Award,
  Zap,
  Brain,
  DollarSign,
  Calendar,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';

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
  priority?: string;
  location?: string;
}

interface WeeklyTrend {
  week: string;
  totalCandidates: number;
  averageDiscrepancy: number;
  aiAccuracy: number;
  aiHigherCount: number;
  humanHigherCount: number;
  equalCount: number;
}

interface HomeTabProps {
  candidates: Candidate[];
  weeklyTrends: WeeklyTrend[];
  scoreAnalysis: {
    averageDiscrepancy: number;
    totalCandidates: number;
    aiHigherCount: number;
    humanHigherCount: number;
    equalScoresCount: number;
  };
}

/**
 * Calculate percentage change between two values
 */
function calculateChange(current: number, previous: number): { value: number; isPositive: boolean; isSignificant: boolean } {
  if (previous === 0) return { value: 0, isPositive: true, isSignificant: false };
  const change = ((current - previous) / previous) * 100;
  return {
    value: Math.abs(change),
    isPositive: change >= 0,
    isSignificant: Math.abs(change) >= 10 // 10% change is significant
  };
}

/**
 * CEO-focused home tab with TREND-FOCUSED insights
 */
export function HomeTab({ candidates, weeklyTrends, scoreAnalysis }: HomeTabProps) {
  // === TREND ANALYSIS (Most Important for CEO) ===
  
  const currentWeek = weeklyTrends[weeklyTrends.length - 1];
  const previousWeek = weeklyTrends[weeklyTrends.length - 2];
  const fourWeeksAgo = weeklyTrends[0];
  
  // Calculate week-over-week changes
  const volumeChange = previousWeek ? calculateChange(currentWeek?.totalCandidates || 0, previousWeek.totalCandidates) : { value: 0, isPositive: true, isSignificant: false };
  const qualityChange = previousWeek ? calculateChange(currentWeek?.aiAccuracy || 0, previousWeek.aiAccuracy) : { value: 0, isPositive: true, isSignificant: false };
  const alignmentChange = previousWeek ? calculateChange(
    Math.abs(currentWeek?.averageDiscrepancy || 0), 
    Math.abs(previousWeek.averageDiscrepancy)
  ) : { value: 0, isPositive: true, isSignificant: false };

  // Calculate 4-week trend
  const fourWeekVolumeChange = fourWeeksAgo ? calculateChange(currentWeek?.totalCandidates || 0, fourWeeksAgo.totalCandidates) : { value: 0, isPositive: true, isSignificant: false };
  const fourWeekQualityChange = fourWeeksAgo ? calculateChange(currentWeek?.aiAccuracy || 0, fourWeeksAgo.aiAccuracy) : { value: 0, isPositive: true, isSignificant: false };

  // Role performance trends
  const rolePerformanceTrends = candidates.reduce((acc: any, candidate) => {
    const role = candidate.role;
    if (!role) return acc; // Skip candidates without roles
    if (!acc[role]) {
      acc[role] = {
        role,
        total: 0,
        quality: 0,
        avgScore: 0,
        scoreSum: 0,
        scoreCount: 0,
        weeklyData: {},
      };
    }
    
    acc[role].total++;
    
    if (candidate.aiScore > 0) {
      acc[role].scoreSum += candidate.aiScore;
      acc[role].scoreCount++;
    }
    
    if (candidate.aiScore >= 7) acc[role].quality++;
    
    // Track by week for trends
    if (candidate.dateAdded) {
      try {
        const candidateDate = new Date(candidate.dateAdded);
        const weekKey = candidateDate.toISOString().split('T')[0].substring(0, 10);
        if (!acc[role].weeklyData[weekKey]) {
          acc[role].weeklyData[weekKey] = { count: 0, qualityCount: 0 };
        }
        acc[role].weeklyData[weekKey].count++;
        if (candidate.aiScore >= 7) acc[role].weeklyData[weekKey].qualityCount++;
      } catch {}
    }
    
    return acc;
  }, {});

  const roleData = Object.values(rolePerformanceTrends).map((role: any) => {
    const avgScore = role.scoreCount > 0 ? role.scoreSum / role.scoreCount : 0;
    const qualityRate = role.total > 0 ? (role.quality / role.total * 100) : 0;
    
    // Calculate role trend
    const weeklyEntries = Object.entries(role.weeklyData).sort(([a], [b]) => a.localeCompare(b));
    const recentWeeks = weeklyEntries.slice(-2);
    const roleTrend = recentWeeks.length === 2 ? 
      calculateChange(recentWeeks[1][1].count, recentWeeks[0][1].count) : 
      { value: 0, isPositive: true, isSignificant: false };
    
    return {
      ...role,
      avgScore,
      qualityRate,
      trend: roleTrend,
      strategicValue: qualityRate * Math.log(role.total + 1), // Quality-weighted by volume
    };
  }).sort((a, b) => b.strategicValue - a.strategicValue);

  // Prepare trend visualization data
  const trendData = weeklyTrends.map(week => ({
    week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    volume: week.totalCandidates,
    quality: week.aiAccuracy,
    alignment: 100 - Math.abs(week.averageDiscrepancy * 10), // Convert to 0-100 scale
    efficiency: week.totalCandidates > 0 ? (week.equalCount / week.totalCandidates * 100) : 0,
  }));

  // Business health indicators
  const businessHealth = {
    volume: {
      current: currentWeek?.totalCandidates || 0,
      trend: volumeChange,
      status: volumeChange.isPositive ? 'Growing' : 'Declining',
      health: volumeChange.isPositive && volumeChange.isSignificant ? 'Excellent' : 
              volumeChange.isPositive ? 'Good' : 'Concerning'
    },
    quality: {
      current: currentWeek?.aiAccuracy || 0,
      trend: qualityChange,
      status: qualityChange.isPositive ? 'Improving' : 'Declining',
      health: (currentWeek?.aiAccuracy || 0) >= 70 ? 'Excellent' : 
              (currentWeek?.aiAccuracy || 0) >= 50 ? 'Good' : 'Critical'
    },
    alignment: {
      current: Math.abs(currentWeek?.averageDiscrepancy || 0),
      trend: alignmentChange,
      status: !alignmentChange.isPositive ? 'Improving' : 'Declining', // Lower discrepancy is better
      health: Math.abs(currentWeek?.averageDiscrepancy || 0) <= 0.5 ? 'Excellent' : 
              Math.abs(currentWeek?.averageDiscrepancy || 0) <= 1.5 ? 'Good' : 'Critical'
    }
  };

  // Calculate hiring forecast based on trends
  const hiringForecast = {
    nextWeekProjection: Math.round((currentWeek?.totalCandidates || 0) * (volumeChange.isPositive ? 1.1 : 0.9)),
    monthlyProjection: Math.round((currentWeek?.totalCandidates || 0) * 4.3 * (volumeChange.isPositive ? 1.1 : 0.9)),
    qualityProjection: Math.round(((currentWeek?.totalCandidates || 0) * (currentWeek?.aiAccuracy || 0) / 100) * (qualityChange.isPositive ? 1.1 : 0.9)),
  };

  const TrendIcon = ({ trend, size = "h-4 w-4" }: { trend: { isPositive: boolean; isSignificant: boolean }, size?: string }) => {
    if (!trend.isSignificant) return <Minus className={`${size} text-gray-400`} />;
    return trend.isPositive ? 
      <ArrowUp className={`${size} text-green-600`} /> : 
      <ArrowDown className={`${size} text-red-600`} />;
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'Excellent': return 'text-green-600';
      case 'Good': return 'text-blue-600';
      case 'Concerning': return 'text-yellow-600';
      case 'Critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* TREND-FOCUSED CEO HEADER */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-6 rounded-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Team Growth Trends</h1>
            <p className="text-blue-100">Are we improving? Week-over-week performance analysis</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-200">4-Week Trajectory</div>
            <div className="flex items-center space-x-2">
              <TrendIcon trend={fourWeekVolumeChange} size="h-6 w-6" />
              <span className="text-2xl font-bold">
                {fourWeekVolumeChange.isPositive ? '+' : ''}{fourWeekVolumeChange.value.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Volume Trend</span>
              <TrendIcon trend={volumeChange} />
            </div>
            <div className="text-2xl font-bold">{currentWeek?.totalCandidates || 0}</div>
            <div className="text-xs text-blue-200">
              {volumeChange.isPositive ? '+' : ''}{volumeChange.value.toFixed(0)}% vs last week
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Quality Trend</span>
              <TrendIcon trend={qualityChange} />
            </div>
            <div className="text-2xl font-bold">{(currentWeek?.aiAccuracy || 0).toFixed(0)}%</div>
            <div className="text-xs text-blue-200">
              {qualityChange.isPositive ? '+' : ''}{qualityChange.value.toFixed(0)}% vs last week
            </div>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-100">Alignment Trend</span>
              <TrendIcon trend={{...alignmentChange, isPositive: !alignmentChange.isPositive}} />
            </div>
            <div className="text-2xl font-bold">{Math.abs(currentWeek?.averageDiscrepancy || 0).toFixed(1)}</div>
            <div className="text-xs text-blue-200">
              {!alignmentChange.isPositive ? 'Better' : 'Worse'} vs last week
            </div>
          </div>
        </div>
      </div>

      {/* BUSINESS HEALTH DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span>Hiring Volume</span>
              </div>
              <TrendIcon trend={volumeChange} size="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${getHealthColor(businessHealth.volume.health)}`}>
              {businessHealth.volume.status}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>This Week:</span>
                <span className="font-bold">{currentWeek?.totalCandidates || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Last Week:</span>
                <span className="font-medium">{previousWeek?.totalCandidates || 0}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>4-Week Avg:</span>
                <span className="font-medium">
                  {weeklyTrends.length > 0 ? (weeklyTrends.reduce((sum, w) => sum + w.totalCandidates, 0) / weeklyTrends.length).toFixed(0) : 0}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-600">
                  <strong>Forecast:</strong> {hiringForecast.nextWeekProjection} next week, {hiringForecast.monthlyProjection} this month
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Brain className="h-5 w-5 text-green-600" />
                <span>AI System Quality</span>
              </div>
              <TrendIcon trend={qualityChange} size="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${getHealthColor(businessHealth.quality.health)}`}>
              {businessHealth.quality.health}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Accuracy:</span>
                <span className="font-bold">{(currentWeek?.aiAccuracy || 0).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Improvement:</span>
                <span className={`font-medium ${qualityChange.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {qualityChange.isPositive ? '+' : ''}{qualityChange.value.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Bias Level:</span>
                <span className={`font-medium ${Math.abs(scoreAnalysis.averageDiscrepancy) <= 0.5 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {Math.abs(scoreAnalysis.averageDiscrepancy).toFixed(2)}
                </span>
              </div>
              <div className="pt-2 border-t">
                <div className="text-xs text-gray-600">
                  <strong>ROI:</strong> ${((scoreAnalysis.totalCandidates * 50) / 1000).toFixed(0)}k saved on screening
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-cyan-500">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-cyan-600" />
                <span>AI-Human Alignment</span>
              </div>
              <TrendIcon trend={{...alignmentChange, isPositive: !alignmentChange.isPositive}} size="h-5 w-5" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold mb-2 ${getHealthColor(businessHealth.alignment.health)}`}>
              {businessHealth.alignment.health}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Discrepancy:</span>
                <span className="font-bold">{Math.abs(currentWeek?.averageDiscrepancy || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Agreement:</span>
                <span className="font-medium">{scoreAnalysis.equalScoresCount} candidates</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>AI Higher:</span>
                <span className="text-red-600 font-medium">{scoreAnalysis.aiHigherCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Human Higher:</span>
                <span className="text-blue-600 font-medium">{scoreAnalysis.humanHigherCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TREND VISUALIZATION - Most Important Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-cyan-600" />
            <span>Performance Trajectory</span>
          </CardTitle>
          <CardDescription>
            Are we improving? 4-week trend analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  typeof value === 'number' ? value.toFixed(1) : value,
                  name === 'volume' ? 'Candidates' :
                  name === 'quality' ? 'AI Accuracy %' :
                  name === 'alignment' ? 'Alignment Score' :
                  name === 'efficiency' ? 'Perfect Match %' : name
                ]}
              />
              <Area yAxisId="right" type="monotone" dataKey="volume" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Volume" />
              <Line yAxisId="left" type="monotone" dataKey="quality" stroke="#10b981" strokeWidth={4} name="Quality" />
              <Line yAxisId="left" type="monotone" dataKey="alignment" stroke="#06b6d4" strokeWidth={3} name="Alignment" />
              <Line yAxisId="left" type="monotone" dataKey="efficiency" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Perfect Match" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROLE PERFORMANCE TRENDS */}
      <Card>
        <CardHeader>
          <CardTitle>Role Performance Trends</CardTitle>
          <CardDescription>
            Which roles are improving? Strategic resource allocation insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roleData.slice(0, 4).map((role) => (
              <Card key={role.role} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>{role.role}</span>
                    <TrendIcon trend={role.trend} />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-blue-600">{role.total}</div>
                    <div className="text-xs text-gray-600">Total Candidates</div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Quality Rate:</span>
                      <span className={`font-bold ${
                        role.qualityRate >= 20 ? 'text-green-600' :
                        role.qualityRate >= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {role.qualityRate.toFixed(1)}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span>Avg Score:</span>
                      <span className={`font-medium ${
                        role.avgScore >= 7 ? 'text-green-600' :
                        role.avgScore >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {role.avgScore.toFixed(1)}
                      </span>
                    </div>
                    
                    <div className="pt-2 border-t">
                      <div className="text-xs text-gray-600">
                        <strong>Trend:</strong> {role.trend.isPositive ? 'Growing' : 'Declining'} 
                        {role.trend.isSignificant && ` (${role.trend.value.toFixed(0)}%)`}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* CEO DECISION MATRIX */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-cyan-600" />
            <span>CEO Decision Matrix</span>
          </CardTitle>
          <CardDescription>
            Data-driven decisions based on performance trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">🚀 SCALE IMMEDIATELY</h4>
              <div className="space-y-2">
                {roleData.filter(r => r.trend.isPositive && r.qualityRate >= 15).map((role) => (
                  <div key={role.role} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">{role.role}</div>
                    <div className="text-sm text-green-700">
                      {role.qualityRate.toFixed(1)}% quality rate, trending {role.trend.isPositive ? 'up' : 'down'} {role.trend.value.toFixed(0)}%
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      <strong>Action:</strong> Increase budget and sourcing for this role
                    </div>
                  </div>
                ))}
                {businessHealth.quality.health === 'Excellent' && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="font-medium text-green-800">AI System</div>
                    <div className="text-sm text-green-700">
                      {(currentWeek?.aiAccuracy || 0).toFixed(1)}% accuracy, saving ${((scoreAnalysis.totalCandidates * 50) / 1000).toFixed(0)}k/month
                    </div>
                    <div className="text-xs text-green-600 mt-1">
                      <strong>Action:</strong> Maintain current AI configuration
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-red-600">🔧 FIX IMMEDIATELY</h4>
              <div className="space-y-2">
                {businessHealth.quality.health === 'Critical' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-800">AI System Calibration</div>
                    <div className="text-sm text-red-700">
                      {(currentWeek?.aiAccuracy || 0).toFixed(1)}% accuracy - below 50% threshold
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      <strong>Action:</strong> Emergency AI prompt review with Martijn
                    </div>
                  </div>
                )}
                
                {businessHealth.volume.health === 'Concerning' && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-800">Declining Volume</div>
                    <div className="text-sm text-red-700">
                      {volumeChange.value.toFixed(0)}% drop in candidate flow
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      <strong>Action:</strong> Scale sourcing channels immediately
                    </div>
                  </div>
                )}
                
                {roleData.filter(r => !r.trend.isPositive && r.total >= 10).map((role) => (
                  <div key={role.role} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="font-medium text-red-800">{role.role} Declining</div>
                    <div className="text-sm text-red-700">
                      {role.trend.value.toFixed(0)}% drop, {role.qualityRate.toFixed(1)}% quality rate
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      <strong>Action:</strong> Review sourcing strategy for this role
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border-l-4 border-l-cyan-500">
            <h5 className="font-bold text-cyan-800 mb-3">📊 CEO WEEKLY SCORECARD</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-medium mb-2">Volume Performance</div>
                <div className={`text-lg font-bold ${getHealthColor(businessHealth.volume.health)}`}>
                  {businessHealth.volume.health}
                </div>
                <div className="text-xs text-gray-600">
                  {volumeChange.isPositive ? 'Growing' : 'Declining'} {volumeChange.value.toFixed(0)}% WoW
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-2">Quality Performance</div>
                <div className={`text-lg font-bold ${getHealthColor(businessHealth.quality.health)}`}>
                  {businessHealth.quality.health}
                </div>
                <div className="text-xs text-gray-600">
                  {qualityChange.isPositive ? 'Improving' : 'Declining'} {qualityChange.value.toFixed(0)}% WoW
                </div>
              </div>
              
              <div>
                <div className="font-medium mb-2">System Performance</div>
                <div className={`text-lg font-bold ${getHealthColor(businessHealth.alignment.health)}`}>
                  {businessHealth.alignment.health}
                </div>
                <div className="text-xs text-gray-600">
                  AI-Human alignment {!alignmentChange.isPositive ? 'improving' : 'declining'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}