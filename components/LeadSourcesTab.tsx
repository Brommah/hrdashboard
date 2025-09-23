'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Target, ExternalLink } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  source: string;
  role: string;
  jobRole: string;
  aiScore: number;
  humanScore: number;
  dateAdded: string;
  status: string;
}

interface WeeklyTrend {
  week: string;
  [key: string]: any;
}

interface LeadSourcesTabProps {
  candidates: Candidate[];
  weeklyTrends: WeeklyTrend[];
}

interface SourceMetrics {
  source: string;
  totalCandidates: number;
  withBothScores: number;
  avgAiScore: number;
  avgHumanScore: number;
  avgDiscrepancy: number;
  conversionRate: number;
}

/**
 * Normalize source names for consistent analysis
 */
function normalizeSourceName(source: string): string | null {
  if (!source || source.trim() === '') return null;
  
  const normalized = source.toLowerCase().trim();
  
  if (normalized.includes('join')) return 'Join';
  if (normalized.includes('wellfound')) return 'Wellfound';
  if (normalized.includes('linkedin')) return 'LinkedIn';
  if (normalized.includes('company website') || normalized.includes('website')) return 'Company Website';
  if (normalized.includes('referral')) return 'Referral';
  if (normalized.includes('outbound')) return 'Outbound';
  
  return null;
}

/**
 * Get consistent colors for sources
 */
function getSourceColor(source: string): string {
  const colorMap: Record<string, string> = {
    'Join': '#3b82f6',
    'Wellfound': '#10b981',
    'LinkedIn': '#8b5cf6',
    'Company Website': '#f59e0b',
    'Outbound': '#ef4444',
    'Referral': '#06b6d4',
    'Other': '#6b7280',
    'Unknown': '#9ca3af',
  };
  
  return colorMap[source] || '#6b7280';
}

/**
 * Lead Sources analytics tab showing performance by source (Join, Wellfound, etc.)
 */
export function LeadSourcesTab({ candidates, weeklyTrends }: LeadSourcesTabProps) {
  // Process candidates by normalized source
  const sourceAnalysis = candidates.reduce((acc: Record<string, any>, candidate) => {
    const normalizedSource = normalizeSourceName(candidate.source);
    
    if (!normalizedSource) return acc; // Skip candidates without valid sources
    
    if (!acc[normalizedSource]) {
      acc[normalizedSource] = {
        source: normalizedSource,
        totalCandidates: 0,
        withBothScores: 0,
        aiScoreSum: 0,
        humanScoreSum: 0,
        discrepancySum: 0,
        aiScoreCount: 0,
        humanScoreCount: 0,
      };
    }
    
    const sourceData = acc[normalizedSource];
    sourceData.totalCandidates++;
    
    if (candidate.aiScore > 0) {
      sourceData.aiScoreSum += candidate.aiScore;
      sourceData.aiScoreCount++;
    }
    
    if (candidate.humanScore > 0) {
      sourceData.humanScoreSum += candidate.humanScore;
      sourceData.humanScoreCount++;
    }
    
    if (candidate.aiScore > 0 && candidate.humanScore > 0) {
      sourceData.withBothScores++;
      sourceData.discrepancySum += (candidate.aiScore - candidate.humanScore);
    }
    
    return acc;
  }, {});

  // Calculate metrics with proper error handling
  const sourceData: SourceMetrics[] = Object.values(sourceAnalysis)
    .map((source: any) => ({
      source: source.source,
      totalCandidates: source.totalCandidates,
      withBothScores: source.withBothScores,
      avgAiScore: source.aiScoreCount > 0 ? source.aiScoreSum / source.aiScoreCount : 0,
      avgHumanScore: source.humanScoreCount > 0 ? source.humanScoreSum / source.humanScoreCount : 0,
      avgDiscrepancy: source.withBothScores > 0 ? source.discrepancySum / source.withBothScores : 0,
      conversionRate: source.totalCandidates > 0 ? (source.withBothScores / source.totalCandidates * 100) : 0,
    }))
    .filter(source => source.totalCandidates > 0)
    .sort((a, b) => b.totalCandidates - a.totalCandidates);

  // Prepare data for pie chart
  const pieData = sourceData.map((source) => ({
    name: source.source,
    value: source.totalCandidates,
    fill: getSourceColor(source.source),
  }));

  // Safe data access with fallbacks
  const topSource = sourceData[0];
  const bestQualitySource = sourceData
    .filter(s => s.avgAiScore > 0)
    .sort((a, b) => b.avgAiScore - a.avgAiScore)[0];
  const avgConversionRate = sourceData.length > 0 
    ? sourceData.reduce((sum, s) => sum + s.conversionRate, 0) / sourceData.length 
    : 0;

  if (sourceData.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Lead Sources Performance</h2>
          <p className="text-gray-600">Analysis of candidate sources: Join, Wellfound, LinkedIn, and more</p>
        </div>
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-gray-500">No source data available</p>
            <p className="text-center text-sm text-gray-400 mt-2">
              Candidates need source information to display analytics
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Lead Sources Performance</h2>
        <p className="text-gray-600">Analysis of candidate sources: Join, Wellfound, LinkedIn, and more</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sourceData.length}</div>
            <p className="text-xs text-muted-foreground">Active lead sources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Top Source</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {topSource?.source || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {topSource?.totalCandidates || 0} candidates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Best Quality</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {bestQualitySource?.source || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground">
              {bestQualitySource?.avgAiScore.toFixed(1) || '0.0'} avg AI score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {avgConversionRate.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Both scores rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Candidate Distribution by Source</CardTitle>
            <CardDescription>
              Total candidates from each lead source
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value, percent }: any) => 
                    `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: any) => [value, 'Candidates']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Source Quality Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Source Quality Comparison</CardTitle>
            <CardDescription>
              Average AI scores by lead source
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sourceData.length > 0 ? (
              <div className="space-y-4">
                {sourceData.map((source, index) => (
                  <div key={source.source} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: getSourceColor(source.source) }}
                      />
                      <div>
                        <div className="font-medium">{source.source}</div>
                        <div className="text-sm text-gray-600">
                          {source.totalCandidates} candidates
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        source.avgAiScore >= 7 ? 'text-green-600' :
                        source.avgAiScore >= 5 ? 'text-yellow-600' : 
                        source.avgAiScore > 0 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {source.avgAiScore > 0 ? source.avgAiScore.toFixed(1) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-500">Avg AI Score</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No source data available for comparison
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Source Table */}
      <Card>
        <CardHeader>
          <CardTitle>Source Performance Details</CardTitle>
          <CardDescription>
            Comprehensive metrics for each lead source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Source</th>
                  <th className="text-left p-3 font-medium">Total</th>
                  <th className="text-left p-3 font-medium">Both Scores</th>
                  <th className="text-left p-3 font-medium">Avg AI Score</th>
                  <th className="text-left p-3 font-medium">Avg Human Score</th>
                  <th className="text-left p-3 font-medium">Discrepancy</th>
                  <th className="text-left p-3 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {sourceData.map((source) => (
                  <tr key={source.source} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: getSourceColor(source.source) }}
                        />
                        <span className="font-medium">{source.source}</span>
                        {source.source !== 'Unknown' && source.source !== 'Outbound' && (
                          <ExternalLink className="h-3 w-3 text-gray-400" />
                        )}
                      </div>
                    </td>
                    <td className="p-3 font-medium">{source.totalCandidates}</td>
                    <td className="p-3">
                      <span className="text-sm text-gray-600">
                        {source.withBothScores} ({source.conversionRate.toFixed(1)}%)
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        source.avgAiScore >= 7 ? 'text-green-600' :
                        source.avgAiScore >= 5 ? 'text-yellow-600' : 
                        source.avgAiScore > 0 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {source.avgAiScore > 0 ? source.avgAiScore.toFixed(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        source.avgHumanScore >= 7 ? 'text-green-600' :
                        source.avgHumanScore >= 5 ? 'text-yellow-600' : 
                        source.avgHumanScore > 0 ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {source.avgHumanScore > 0 ? source.avgHumanScore.toFixed(1) : 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`font-medium ${
                        Math.abs(source.avgDiscrepancy) <= 0.5 ? 'text-green-600' :
                        Math.abs(source.avgDiscrepancy) <= 1.5 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {source.withBothScores > 0 ? 
                          `${source.avgDiscrepancy > 0 ? '+' : ''}${source.avgDiscrepancy.toFixed(2)}` : 
                          'N/A'
                        }
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all" 
                            style={{ width: `${Math.min(source.conversionRate, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          {source.conversionRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Source Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <span>Join Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const joinData = sourceData.find(s => s.source === 'Join');
              return joinData ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">{joinData.totalCandidates}</div>
                  <p className="text-sm text-gray-600">Total candidates</p>
                  <div className="text-lg font-medium">{joinData.avgAiScore.toFixed(1)}</div>
                  <p className="text-xs text-gray-500">Average AI score</p>
                  <div className="text-sm text-gray-600">
                    {joinData.conversionRate.toFixed(1)}% conversion rate
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No Join candidates found</p>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span>Wellfound Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const wellfoundData = sourceData.find(s => s.source === 'Wellfound');
              return wellfoundData ? (
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">{wellfoundData.totalCandidates}</div>
                  <p className="text-sm text-gray-600">Total candidates</p>
                  <div className="text-lg font-medium">{wellfoundData.avgAiScore.toFixed(1)}</div>
                  <p className="text-xs text-gray-500">Average AI score</p>
                  <div className="text-sm text-gray-600">
                    {wellfoundData.conversionRate.toFixed(1)}% conversion rate
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No Wellfound candidates found</p>
              );
            })()}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-600" />
              <span>Best Conversion</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const bestConversionSource = sourceData
                .filter(s => s.totalCandidates >= 3) // Only consider sources with meaningful volume
                .sort((a, b) => b.conversionRate - a.conversionRate)[0];
              
              return bestConversionSource ? (
                <div className="space-y-2">
                  <div className="text-lg font-bold text-purple-600">
                    {bestConversionSource.source}
                  </div>
                  <p className="text-sm text-gray-600">{bestConversionSource.conversionRate.toFixed(1)}% conversion</p>
                  <div className="text-sm font-medium">{bestConversionSource.withBothScores} scored candidates</div>
                  <p className="text-xs text-gray-500">out of {bestConversionSource.totalCandidates} total</p>
                </div>
              ) : (
                <p className="text-gray-500">Insufficient data</p>
              );
            })()}
          </CardContent>
        </Card>
      </div>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Source Performance Insights</CardTitle>
          <CardDescription>
            Key takeaways and recommendations for source optimization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-blue-600">📈 Volume Leaders</h4>
              <ul className="space-y-2">
                {sourceData.slice(0, 3).map((source, index) => (
                  <li key={source.source} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm font-medium">
                      #{index + 1} {source.source}
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {source.totalCandidates}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-green-600">🎯 Quality Leaders</h4>
              <ul className="space-y-2">
                {sourceData
                  .filter(s => s.avgAiScore > 0)
                  .sort((a, b) => b.avgAiScore - a.avgAiScore)
                  .slice(0, 3)
                  .map((source, index) => (
                    <li key={source.source} className="flex items-center justify-between p-2 bg-green-50 rounded">
                      <span className="text-sm font-medium">
                        #{index + 1} {source.source}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        {source.avgAiScore.toFixed(1)}
                      </span>
                    </li>
                  ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
