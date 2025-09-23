'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
// Simple role name getter
const getRoleName = (candidate: Candidate): string => {
  return candidate.jobRole || candidate.role || 'No Role';
};

interface Candidate {
  id: string;
  name: string;
  dateAdded: string;
  status: string;
  source: string;
  jobRole: string;
  role: string;
  aiScore: number;
  humanScore: number;
  interviewStatus?: string;
}

interface HomeTabProps {
  candidates: Candidate[];
  weeklyTrends: any[];
  scoreAnalysis: any;
}

/**
 * Executive Summary - Simple, reliable metrics for CEO dashboard
 */
export function HomeTab({ candidates }: HomeTabProps) {
  // Simple filtering (excludes candidates without sources)
  const validCandidates = candidates.filter(c => 
    c.name && c.dateAdded && (c.jobRole || c.role) && c.source && c.source.trim() !== ''
  );
  const aiProcessed = validCandidates.filter(c => c.aiScore > 0);
  const fullyReviewed = validCandidates.filter(c => c.aiScore > 0 && c.humanScore > 0);
  const pendingReviews = validCandidates.filter(c => c.aiScore >= 5 && c.humanScore === 0);
  const highDiscrepancy = validCandidates.filter(c => 
    c.aiScore > 0 && c.humanScore > 0 && Math.abs(c.aiScore - c.humanScore) >= 3
  );

  // Simple, reliable metrics
  const metrics = {
    totalCandidates: validCandidates.length,
    aiProcessed: aiProcessed.length,
    pendingHumanReview: pendingReviews.length,
    fullyReviewed: fullyReviewed.length,
    highDiscrepancy: highDiscrepancy.length,
    
    // Processing rates
    aiProcessingRate: validCandidates.length > 0 ? (aiProcessed.length / validCandidates.length * 100) : 0,
    humanReviewRate: aiProcessed.length > 0 ? (fullyReviewed.length / aiProcessed.length * 100) : 0,
    
    // Quality metrics
    avgAiScore: aiProcessed.length > 0 ? aiProcessed.reduce((sum, c) => sum + c.aiScore, 0) / aiProcessed.length : 0,
    avgHumanScore: fullyReviewed.length > 0 ? fullyReviewed.reduce((sum, c) => sum + c.humanScore, 0) / fullyReviewed.length : 0,
    avgDiscrepancy: fullyReviewed.length > 0 ? fullyReviewed.reduce((sum, c) => sum + Math.abs(c.aiScore - c.humanScore), 0) / fullyReviewed.length : 0,
  };

  // Role breakdown (only valid candidates with sources)
  const roleBreakdown = validCandidates.reduce((acc: any, candidate) => {
    const role = getRoleName(candidate);
    if (!acc[role]) {
      acc[role] = { total: 0, aiProcessed: 0, pendingReview: 0 };
    }
    acc[role].total++;
    if (candidate.aiScore > 0) acc[role].aiProcessed++;
    if (candidate.aiScore >= 5 && candidate.humanScore === 0) acc[role].pendingReview++;
    return acc;
  }, {});

  const roleData = Object.values(roleBreakdown).sort((a: any, b: any) => b.total - a.total);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Executive Summary</h2>
        <p className="text-gray-600">Key hiring metrics and actionable insights</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span>Total Pipeline</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{metrics.totalCandidates}</div>
            <p className="text-xs text-gray-600">Valid candidates in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span>AI Processed</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.aiProcessed}</div>
            <p className="text-xs text-gray-600">{metrics.aiProcessingRate.toFixed(1)}% of total pipeline</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span>Pending Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{metrics.pendingHumanReview}</div>
            <p className="text-xs text-gray-600">High-quality candidates awaiting managers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span>Needs Attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{metrics.highDiscrepancy}</div>
            <p className="text-xs text-gray-600">AI-Human score misalignment</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg text-blue-800">Pipeline Health</CardTitle>
            <CardDescription className="text-blue-600">
              How efficiently we're processing candidates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">AI Processing Rate</span>
                <span className={`font-bold ${metrics.aiProcessingRate >= 80 ? 'text-green-600' : metrics.aiProcessingRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.aiProcessingRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Human Review Rate</span>
                <span className={`font-bold ${metrics.humanReviewRate >= 80 ? 'text-green-600' : metrics.humanReviewRate >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.humanReviewRate.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Review Backlog</span>
                <span className={`font-bold ${metrics.pendingHumanReview <= 10 ? 'text-green-600' : metrics.pendingHumanReview <= 25 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.pendingHumanReview} candidates
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-l-green-500">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">Quality Metrics</CardTitle>
            <CardDescription className="text-green-600">
              Scoring quality and alignment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Avg AI Score</span>
                <span className="font-bold text-green-600">{metrics.avgAiScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Avg Human Score</span>
                <span className="font-bold text-green-600">{metrics.avgHumanScore.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Avg Discrepancy</span>
                <span className={`font-bold ${metrics.avgDiscrepancy <= 1 ? 'text-green-600' : metrics.avgDiscrepancy <= 2 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {metrics.avgDiscrepancy.toFixed(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-lg text-purple-800">Action Items</CardTitle>
            <CardDescription className="text-purple-600">
              What needs immediate attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.pendingHumanReview > 20 && (
                <div className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>High review backlog ({metrics.pendingHumanReview})</span>
                </div>
              )}
              {metrics.highDiscrepancy > 5 && (
                <div className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>AI calibration needed ({metrics.highDiscrepancy} cases)</span>
                </div>
              )}
              {metrics.aiProcessingRate < 70 && (
                <div className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>AI processing bottleneck</span>
                </div>
              )}
              {metrics.pendingHumanReview <= 10 && metrics.highDiscrepancy <= 3 && metrics.aiProcessingRate >= 80 && (
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>System running smoothly</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Role Performance Overview</CardTitle>
          <CardDescription>
            Candidate volume and review status by role
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roleData.slice(0, 6).map((role: any) => (
              <div key={role.role} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="font-medium text-gray-900">{role.role}</div>
                  <div className="text-sm text-gray-600">({role.total} candidates)</div>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{role.aiProcessed} AI processed</span>
                  </div>
                  {role.pendingReview > 0 && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-yellow-500" />
                      <span>{role.pendingReview} pending review</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}