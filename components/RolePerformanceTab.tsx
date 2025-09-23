'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Briefcase, TrendingUp, Users, Award } from 'lucide-react';
import { candidateFilters, getRoleName } from '@/lib/candidateFilters';

interface Candidate {
  id: string;
  name: string;
  role: string;
  aiScore: number;
  humanScore: number;
  dateAdded: string;
  status: string;
  source: string;
}

interface RolePerformanceTabProps {
  candidates: Candidate[];
  weeklyTrends: any[];
}

/**
 * Role Performance tab showing analytics by job role (AI Engineer, AI Innovator, PSE, FA)
 */
export function RolePerformanceTab({ candidates, weeklyTrends }: RolePerformanceTabProps) {
  // Debug: Check what role values we actually have
  console.log('Role field sample:', candidates.slice(0, 10).map(c => ({ 
    name: c.name, 
    role: c.role, 
    jobRole: c.jobRole,
    aiScore: c.aiScore,
    humanScore: c.humanScore 
  })));

  // Process candidates by role
  const roleAnalysis = candidates.reduce((acc: any, candidate) => {
    const role = candidate.jobRole || candidate.role || 'No Role';
    
    // Don't skip - we need to see all data
    
    if (!acc[role]) {
      acc[role] = {
        role,
        totalCandidates: 0,
        withBothScores: 0,
        aiProcessedCount: 0,
        humanProcessedCount: 0,
        avgAiScore: 0,
        avgHumanScore: 0,
        avgDiscrepancy: 0,
        aiScoreSum: 0,
        humanScoreSum: 0,
        discrepancySum: 0,
        sources: {},
        statuses: {},
      };
    }
    
    acc[role].totalCandidates++;
    
    // Track sources
    const source = candidate.source;
    if (!source) return acc; // Skip candidates without sources
    acc[role].sources[source] = (acc[role].sources[source] || 0) + 1;
    
    // Track statuses
    const status = candidate.status;
    if (!status) return acc; // Skip candidates without status
    acc[role].statuses[status] = (acc[role].statuses[status] || 0) + 1;
    
    if (candidate.aiScore > 0) {
      acc[role].aiScoreSum += candidate.aiScore;
      acc[role].aiProcessedCount = (acc[role].aiProcessedCount || 0) + 1;
    }
    
    if (candidate.humanScore > 0) {
      acc[role].humanScoreSum += candidate.humanScore;
      acc[role].humanProcessedCount = (acc[role].humanProcessedCount || 0) + 1;
    }
    
    if (candidate.aiScore > 0 && candidate.humanScore > 0) {
      acc[role].withBothScores++;
      acc[role].discrepancySum += (candidate.aiScore - candidate.humanScore);
    }
    
    return acc;
  }, {});

  // Calculate averages correctly
  const roleData = Object.values(roleAnalysis).map((role: any) => ({
    ...role,
    // AI average should be based on candidates who actually have AI scores
    avgAiScore: (role.aiProcessedCount || 0) > 0 ? (role.aiScoreSum / role.aiProcessedCount) : 0,
    // Human average should be based on candidates who actually have human scores  
    avgHumanScore: (role.humanProcessedCount || 0) > 0 ? (role.humanScoreSum / role.humanProcessedCount) : 0,
    // Discrepancy average based on candidates with both scores
    avgDiscrepancy: role.withBothScores > 0 ? (role.discrepancySum / role.withBothScores) : 0,
    // Processing rates
    aiProcessingRate: role.totalCandidates > 0 ? (role.aiProcessedCount / role.totalCandidates * 100) : 0,
    humanReviewRate: (role.aiProcessedCount || 0) > 0 ? (role.withBothScores / role.aiProcessedCount * 100) : 0,
    // Show both scores count instead of conversion rate
    bothScoresCount: role.withBothScores,
    aiProcessedCount: role.aiProcessedCount || 0,
    topSource: Object.entries(role.sources).sort(([,a]: any, [,b]: any) => b - a)[0]?.[0] || 'No Data',
  })).sort((a, b) => b.totalCandidates - a.totalCandidates);

  // Weekly trends by role
  const weeklyRoleTrends = weeklyTrends.map(week => {
    const weekCandidates = candidates.filter(c => {
      if (!c.dateAdded) return false;
      const candidateDate = new Date(c.dateAdded);
      const weekDate = new Date(week.week);
      const weekEnd = new Date(weekDate);
      weekEnd.setDate(weekEnd.getDate() + 7);
      return candidateDate >= weekDate && candidateDate < weekEnd;
    });

    const roleCounts = weekCandidates.reduce((acc: any, candidate) => {
      const role = candidate.role;
    if (!role) return acc; // Skip candidates without roles
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});

    return {
      week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...roleCounts,
      total: weekCandidates.length,
    };
  });

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      'AI Engineer': '#3b82f6',
      'AI Innovator': '#10b981',
      'Principal Fullstack Engineer': '#8b5cf6',
      'Founder\'s Associate': '#f59e0b',
      'Operations Generalist': '#06b6d4',
      'DevOps Lead': '#ef4444',
    };
    
    return colors[role] || '#6b7280';
  };

  const getRoleIcon = (role: string) => {
    if (role.includes('AI')) return '🤖';
    if (role.includes('Engineer')) return '⚙️';
    if (role.includes('Founder')) return '🚀';
    if (role.includes('Operations')) return '📊';
    return '👤';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Role Performance Analysis</h2>
        <p className="text-gray-600">Performance metrics by job role: AI Engineer, AI Innovator, PSE, Founder's Associate</p>
      </div>

      {/* Role Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {roleData.slice(0, 4).map((role) => (
          <Card key={role.role}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center space-x-2">
                <span>{getRoleIcon(role.role)}</span>
                <span>{role.role}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" style={{ color: getRoleColor(role.role) }}>
                {role.totalCandidates}
              </div>
              <p className="text-xs text-muted-foreground mb-2">Total candidates</p>
              
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Avg AI Score:</span>
                  <span className="font-medium">{role.avgAiScore.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Both Scores:</span>
                  <span className="font-medium">{role.bothScoresCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Top Source:</span>
                  <span className="font-medium text-xs">
                    {role.topSource.replace('Inbound: ', '')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Role Quality Comparison</CardTitle>
            <CardDescription>
              Average AI scores and candidate volume by role
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="role" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  tickFormatter={(value) => value.length > 15 ? value.substring(0, 15) + '...' : value}
                />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value: any, name: string) => [
                    name === 'totalCandidates' ? value : value.toFixed(2),
                    name === 'totalCandidates' ? 'Total Candidates' : 'Avg AI Score'
                  ]}
                />
                <Bar yAxisId="right" dataKey="totalCandidates" fill="#e5e7eb" name="Total Candidates" />
                <Bar yAxisId="left" dataKey="avgAiScore" fill="#3b82f6" name="Avg AI Score" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Role Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Weekly Role Trends</CardTitle>
            <CardDescription>
              Candidate volume by role over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyRoleTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                {/* Dynamically create lines for each role */}
                {Object.keys(weeklyRoleTrends[0] || {})
                  .filter(key => key !== 'week' && key !== 'total')
                  .map((role) => (
                    <Line
                      key={role}
                      type="monotone"
                      dataKey={role}
                      stroke={getRoleColor(role)}
                      strokeWidth={2}
                      name={role}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Role Table */}
      <Card>
        <CardHeader>
          <CardTitle>Role Performance Details</CardTitle>
          <CardDescription>
            Comprehensive metrics for each job role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">AI Processed</th>
                  <th className="text-left p-3 font-medium">Avg AI Score</th>
                  <th className="text-left p-3 font-medium">Fully Reviewed</th>
                  <th className="text-left p-3 font-medium">Avg Human Score</th>
                  <th className="text-left p-3 font-medium">Top Source</th>
                  <th className="text-left p-3 font-medium">Status Breakdown</th>
                </tr>
              </thead>
              <tbody>
                {roleData.map((role) => (
                  <tr key={role.role} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getRoleIcon(role.role)}</span>
                        <span className="font-medium">{role.role}</span>
                      </div>
                    </td>
                    <td className="p-3 font-medium">{role.totalCandidates}</td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">
                        {role.aiProcessedCount} ({role.totalCandidates > 0 ? (role.aiProcessedCount / role.totalCandidates * 100).toFixed(1) : 0}%)
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        role.avgAiScore >= 7 ? 'text-green-600' :
                        role.avgAiScore >= 5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {role.avgAiScore.toFixed(1)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">
                        {role.bothScoresCount}
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
                        Math.abs(role.avgDiscrepancy) <= 0.5 ? 'text-green-600' :
                        Math.abs(role.avgDiscrepancy) <= 1.5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {role.bothScoresCount > 0 ? 
                          `${role.avgDiscrepancy > 0 ? '+' : ''}${role.avgDiscrepancy.toFixed(2)}` : 
                          'N/A'
                        }
                      </span>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">
                        {role.topSource.replace('Inbound: ', '')}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(role.statuses)
                          .sort(([,a]: any, [,b]: any) => b - a)
                          .slice(0, 2)
                          .map(([status, count]: any) => (
                            <Badge key={status} variant="secondary" className="text-xs">
                              {status}: {count}
                            </Badge>
                          ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Role Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Award className="h-5 w-5 text-green-600" />
              <span>Highest Quality Role</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const bestQualityRole = roleData
                .filter(r => r.avgAiScore > 0)
                .sort((a, b) => b.avgAiScore - a.avgAiScore)[0];
              
              return bestQualityRole ? (
                <div className="space-y-2">
                  <div className="text-xl font-bold text-green-600">
                    {bestQualityRole.role}
                  </div>
                  <div className="text-lg font-medium">{bestQualityRole.avgAiScore.toFixed(1)}</div>
                  <p className="text-xs text-gray-500">Average AI score</p>
                  <p className="text-sm text-gray-600">{bestQualityRole.totalCandidates} total candidates</p>
                </div>
              ) : (
                <p className="text-gray-500">No scored roles found</p>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Highest Volume Role</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const highestVolumeRole = roleData[0];
              
              return highestVolumeRole ? (
                <div className="space-y-2">
                  <div className="text-xl font-bold text-blue-600">
                    {highestVolumeRole.role}
                  </div>
                  <div className="text-lg font-medium">{highestVolumeRole.totalCandidates}</div>
                  <p className="text-xs text-gray-500">Total candidates</p>
                  <p className="text-sm text-gray-600">
                    {highestVolumeRole.avgAiScore.toFixed(1)} avg AI score
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No data available</p>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <span>Best Score Alignment</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const bestAlignmentRole = roleData
                .filter(r => r.bothScoresCount > 0)
                .sort((a, b) => Math.abs(a.avgDiscrepancy) - Math.abs(b.avgDiscrepancy))[0];
              
              return bestAlignmentRole ? (
                <div className="space-y-2">
                  <div className="text-xl font-bold text-purple-600">
                    {bestAlignmentRole.role}
                  </div>
                  <div className="text-lg font-medium">
                    {Math.abs(bestAlignmentRole.avgDiscrepancy).toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500">Avg discrepancy (lower is better)</p>
                  <p className="text-sm text-gray-600">
                    {bestAlignmentRole.bothScoresCount} candidates with both scores
                  </p>
                </div>
              ) : (
                <p className="text-gray-500">No alignment data available</p>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Role Performance Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Role Performance Matrix</CardTitle>
          <CardDescription>
            Quality vs Volume analysis for strategic role prioritization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Volume Leaders (Total Candidates)</h4>
              <div className="space-y-3">
                {roleData.slice(0, 4).map((role, index) => (
                  <div key={role.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg font-bold text-gray-500">#{index + 1}</div>
                      <div>
                        <div className="font-medium">{role.role}</div>
                        <div className="text-sm text-gray-600">
                          {role.bothScoresCount} fully reviewed ({role.humanReviewRate.toFixed(1)}%)
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold" style={{ color: getRoleColor(role.role) }}>
                      {role.totalCandidates}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-3">Quality Leaders (AI Score)</h4>
              <div className="space-y-3">
                {roleData
                  .filter(r => r.avgAiScore > 0)
                  .sort((a, b) => b.avgAiScore - a.avgAiScore)
                  .slice(0, 4)
                  .map((role, index) => (
                    <div key={role.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg font-bold text-gray-500">#{index + 1}</div>
                        <div>
                          <div className="font-medium">{role.role}</div>
                          <div className="text-sm text-gray-600">
                            {role.totalCandidates} total candidates
                          </div>
                        </div>
                      </div>
                      <div className="text-xl font-bold text-green-600">
                        {role.avgAiScore.toFixed(1)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strategic Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Strategic Role Insights</CardTitle>
          <CardDescription>
            Key findings and recommendations for role optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-green-600">🎯 Focus Areas</h4>
              <ul className="space-y-2 text-sm">
                {roleData.slice(0, 2).map((role) => (
                  <li key={role.role} className="flex items-start space-x-2">
                    <span className="text-green-600">•</span>
                    <div>
                      <span className="font-medium">{role.role}</span>: 
                      Strong volume ({role.totalCandidates} candidates) with {role.avgAiScore.toFixed(1)} avg AI score
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-orange-600">⚠️ Optimization Opportunities</h4>
              <ul className="space-y-2 text-sm">
                {roleData
                  .filter(r => r.avgAiScore > 0 && r.avgAiScore < 6)
                  .map((role) => (
                    <li key={role.role} className="flex items-start space-x-2">
                      <span className="text-orange-600">•</span>
                      <div>
                        <span className="font-medium">{role.role}</span>: 
                        Consider improving sourcing quality (current avg: {role.avgAiScore.toFixed(1)})
                      </div>
                    </li>
                  ))}
                {roleData.filter(r => r.avgAiScore > 0 && r.avgAiScore < 6).length === 0 && (
                  <li className="text-gray-500">All roles performing well! 🎉</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
