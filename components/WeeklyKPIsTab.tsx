'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, Users, Award, AlertTriangle } from 'lucide-react';

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
  date: Date;
  totalCandidates: number;
  [key: string]: any;
}

interface WeeklyKPIsTabProps {
  candidates: Candidate[];
  weeklyTrends: WeeklyTrend[];
}

/**
 * Weekly KPIs tab matching the Team Growth execution format (L / QL / QC / H)
 */
export function WeeklyKPIsTab({ candidates, weeklyTrends }: WeeklyKPIsTabProps) {
  // Calculate KPIs for each week
  const weeklyKPIs = weeklyTrends.map(week => {
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

    // L = Leads (total candidates)
    const leads = weekCandidates.length;
    
    // QL = Quality Leads (passed AI filter or high AI score)
    const qualityLeads = weekCandidates.filter(c => 
      c.passedAiFilter || c.aiScore >= 7
    ).length;
    
    // QC = Quality Candidates (passed both AI and human filters)
    const qualityCandidates = weekCandidates.filter(c => 
      c.passedAiFilter && c.passedHumanFilter
    ).length;
    
    // H = Hires (status indicates hired)
    const hires = weekCandidates.filter(c => 
      c.status?.toLowerCase().includes('hired') || 
      c.status?.toLowerCase().includes('offer')
    ).length;

    // Role breakdown
    const roleBreakdown = weekCandidates.reduce((acc: any, candidate) => {
      const role = candidate.role;
      if (!role) return acc; // Skip candidates without roles
      if (!acc[role]) {
        acc[role] = { leads: 0, qualityLeads: 0, qualityCandidates: 0, hires: 0 };
      }
      
      acc[role].leads++;
      if (candidate.passedAiFilter || candidate.aiScore >= 7) {
        acc[role].qualityLeads++;
      }
      if (candidate.passedAiFilter && candidate.passedHumanFilter) {
        acc[role].qualityCandidates++;
      }
      if (candidate.status?.toLowerCase().includes('hired') || 
          candidate.status?.toLowerCase().includes('offer')) {
        acc[role].hires++;
      }
      
      return acc;
    }, {});

    return {
      week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: week.week,
      leads,
      qualityLeads,
      qualityCandidates,
      hires,
      conversionRate: leads > 0 ? (qualityLeads / leads * 100) : 0,
      closeRate: qualityLeads > 0 ? (hires / qualityLeads * 100) : 0,
      roleBreakdown,
    };
  });

  // Calculate trends
  const getTrend = (data: number[]) => {
    if (data.length < 2) return 'stable';
    const recent = data.slice(-2);
    const change = recent[1] - recent[0];
    if (Math.abs(change) < 1) return 'stable';
    return change > 0 ? 'up' : 'down';
  };

  const leadsTrend = getTrend(weeklyKPIs.map(w => w.leads));
  const qualityTrend = getTrend(weeklyKPIs.map(w => w.qualityLeads));
  const hireTrend = getTrend(weeklyKPIs.map(w => w.hires));

  // Current week totals
  const currentWeek = weeklyKPIs[weeklyKPIs.length - 1];
  const previousWeek = weeklyKPIs[weeklyKPIs.length - 2];

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Weekly KPIs</h2>
        <p className="text-gray-600">L / QL / QC / H metrics tracking (Leads / Quality Leads / Quality Candidates / Hires)</p>
      </div>

      {/* Current Week Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Leads (L)</span>
              <TrendIcon trend={leadsTrend} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {currentWeek?.leads || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {previousWeek ? `${currentWeek?.leads - previousWeek?.leads > 0 ? '+' : ''}${currentWeek?.leads - previousWeek?.leads || 0} from last week` : 'This week'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Target className="h-4 w-4 text-green-600" />
              <span>Quality Leads (QL)</span>
              <TrendIcon trend={qualityTrend} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {currentWeek?.qualityLeads || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentWeek?.conversionRate.toFixed(1) || 0}% of total leads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span>Quality Candidates (QC)</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {currentWeek?.qualityCandidates || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Passed both filters
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Hires (H)</span>
              <TrendIcon trend={hireTrend} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {currentWeek?.hires || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {currentWeek?.closeRate.toFixed(1) || 0}% close rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Trends Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly KPI Trends</CardTitle>
          <CardDescription>
            L / QL / QC / H performance over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={weeklyKPIs}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  value,
                  name === 'leads' ? 'Leads (L)' :
                  name === 'qualityLeads' ? 'Quality Leads (QL)' :
                  name === 'qualityCandidates' ? 'Quality Candidates (QC)' :
                  name === 'hires' ? 'Hires (H)' : name
                ]}
              />
              <Line type="monotone" dataKey="leads" stroke="#3b82f6" strokeWidth={3} name="Leads" />
              <Line type="monotone" dataKey="qualityLeads" stroke="#10b981" strokeWidth={3} name="Quality Leads" />
              <Line type="monotone" dataKey="qualityCandidates" stroke="#f59e0b" strokeWidth={3} name="Quality Candidates" />
              <Line type="monotone" dataKey="hires" stroke="#ef4444" strokeWidth={3} name="Hires" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Weekly KPI Table */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly KPI Breakdown</CardTitle>
          <CardDescription>
            Detailed L / QL / QC / H metrics for each week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Week</th>
                  <th className="text-left p-3 font-medium">L (Leads)</th>
                  <th className="text-left p-3 font-medium">QL (Quality Leads)</th>
                  <th className="text-left p-3 font-medium">QC (Quality Candidates)</th>
                  <th className="text-left p-3 font-medium">H (Hires)</th>
                  <th className="text-left p-3 font-medium">L→QL Rate</th>
                  <th className="text-left p-3 font-medium">QL→H Rate</th>
                </tr>
              </thead>
              <tbody>
                {weeklyKPIs.slice().reverse().map((week) => (
                  <tr key={week.week} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{week.week}</td>
                    <td className="p-3">
                      <span className="text-blue-600 font-bold">{week.leads}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-green-600 font-bold">{week.qualityLeads}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-orange-600 font-bold">{week.qualityCandidates}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-red-600 font-bold">{week.hires}</span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        week.conversionRate >= 20 ? 'text-green-600' :
                        week.conversionRate >= 10 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {week.conversionRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        week.closeRate >= 10 ? 'text-green-600' :
                        week.closeRate >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {week.closeRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role-specific KPIs */}
      {currentWeek?.roleBreakdown && Object.keys(currentWeek.roleBreakdown).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Week by Role</CardTitle>
            <CardDescription>
              L / QL / QC / H breakdown for each job role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(currentWeek.roleBreakdown).map(([role, metrics]: [string, any]) => (
                <Card key={role} className="border-l-4" style={{ borderLeftColor: '#3b82f6' }}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{role}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">L:</span>
                        <span className="font-bold text-blue-600">{metrics.leads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">QL:</span>
                        <span className="font-bold text-green-600">{metrics.qualityLeads}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">QC:</span>
                        <span className="font-bold text-orange-600">{metrics.qualityCandidates}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">H:</span>
                        <span className="font-bold text-red-600">{metrics.hires}</span>
                      </div>
                      <div className="pt-2 border-t">
                        <div className="flex justify-between text-xs">
                          <span>Conversion:</span>
                          <span className="font-medium">
                            {metrics.leads > 0 ? (metrics.qualityLeads / metrics.leads * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* KPI Goals vs Actuals */}
      <Card>
        <CardHeader>
          <CardTitle>Goals vs Actuals</CardTitle>
          <CardDescription>
            Performance against Team Growth targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-blue-600">📊 Current Week Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                  <div>
                    <div className="font-medium">Leads (L)</div>
                    <div className="text-sm text-gray-600">Goal: ~50-100 per week</div>
                  </div>
                  <div className="text-xl font-bold text-blue-600">
                    {currentWeek?.leads || 0}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                  <div>
                    <div className="font-medium">Quality Leads (QL)</div>
                    <div className="text-sm text-gray-600">Goal: ~10-20 per week</div>
                  </div>
                  <div className="text-xl font-bold text-green-600">
                    {currentWeek?.qualityLeads || 0}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded">
                  <div>
                    <div className="font-medium">Quality Candidates (QC)</div>
                    <div className="text-sm text-gray-600">Goal: ~5-10 per week</div>
                  </div>
                  <div className="text-xl font-bold text-orange-600">
                    {currentWeek?.qualityCandidates || 0}
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-red-50 rounded">
                  <div>
                    <div className="font-medium">Hires (H)</div>
                    <div className="text-sm text-gray-600">Goal: ~1 per month</div>
                  </div>
                  <div className="text-xl font-bold text-red-600">
                    {currentWeek?.hires || 0}
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-purple-600">📈 Trend Analysis</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Lead Volume Trend</span>
                  <div className="flex items-center space-x-2">
                    <TrendIcon trend={leadsTrend} />
                    <span className="text-sm font-medium capitalize">{leadsTrend}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Quality Trend</span>
                  <div className="flex items-center space-x-2">
                    <TrendIcon trend={qualityTrend} />
                    <span className="text-sm font-medium capitalize">{qualityTrend}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-3 border rounded">
                  <span className="text-sm">Hire Rate Trend</span>
                  <div className="flex items-center space-x-2">
                    <TrendIcon trend={hireTrend} />
                    <span className="text-sm font-medium capitalize">{hireTrend}</span>
                  </div>
                </div>
                
                <div className="p-3 bg-gray-50 rounded">
                  <div className="text-sm font-medium mb-1">Overall Health</div>
                  <div className="text-xs text-gray-600">
                    {leadsTrend === 'up' && qualityTrend === 'up' ? '🟢 Excellent - Volume and quality both improving' :
                     leadsTrend === 'up' || qualityTrend === 'up' ? '🟡 Good - Some improvement' :
                     '🔴 Needs attention - Consider optimizing sourcing'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
