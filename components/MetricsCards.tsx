'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, AlertTriangle } from 'lucide-react';
import { candidateFilters } from '@/lib/candidateFilters';

interface MetricsCardsProps {
  scoreAnalysis: {
    averageDiscrepancy: number;
    maxDiscrepancy: number;
    minDiscrepancy: number;
    totalCandidates: number;
    aiHigherCount: number;
    humanHigherCount: number;
    equalScoresCount: number;
  };
}

/**
 * Metrics cards component showing key score discrepancy statistics
 */
export function MetricsCards({ scoreAnalysis }: MetricsCardsProps) {
  const {
    averageDiscrepancy,
    maxDiscrepancy,
    minDiscrepancy,
    totalCandidates,
    aiHigherCount,
    humanHigherCount,
    equalScoresCount,
  } = scoreAnalysis;

  const formatDiscrepancy = (value: number) => {
    return value > 0 ? `+${value.toFixed(2)}` : value.toFixed(2);
  };

  const getDiscrepancyColor = (value: number) => {
    if (Math.abs(value) < 0.5) return 'text-green-600';
    if (Math.abs(value) < 1.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const aiHigherPercentage = totalCandidates > 0 ? (aiHigherCount / totalCandidates * 100) : 0;
  const humanHigherPercentage = totalCandidates > 0 ? (humanHigherCount / totalCandidates * 100) : 0;
  const equalPercentage = totalCandidates > 0 ? (equalScoresCount / totalCandidates * 100) : 0;

  // Calculate system health indicators
  const systemHealth = {
    alignment: Math.abs(averageDiscrepancy) <= 0.5 ? 'Excellent' : 
               Math.abs(averageDiscrepancy) <= 1.0 ? 'Good' : 'Needs Calibration',
    bias: averageDiscrepancy > 1 ? 'AI Too High' : 
          averageDiscrepancy < -1 ? 'AI Too Low' : 'Balanced',
    coverage: totalCandidates >= 50 ? 'High' : totalCandidates >= 20 ? 'Medium' : 'Low'
  };

  return (
    <div className="space-y-4">
      {/* System Health Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg text-blue-800">AI System Health Check</CardTitle>
          <CardDescription className="text-blue-600">
            How well AI and Human reviewers agree on candidate quality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className={`text-xl font-bold ${
                systemHealth.alignment === 'Excellent' ? 'text-green-600' :
                systemHealth.alignment === 'Good' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {systemHealth.alignment}
              </div>
              <div className="text-sm text-gray-600">Alignment Quality</div>
              <div className="text-xs text-gray-500">{Math.abs(averageDiscrepancy).toFixed(2)} avg discrepancy</div>
            </div>
            
            <div className="text-center">
              <div className={`text-xl font-bold ${
                systemHealth.bias === 'Balanced' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {systemHealth.bias}
              </div>
              <div className="text-sm text-gray-600">Scoring Bias</div>
              <div className="text-xs text-gray-500">
                {averageDiscrepancy > 0 ? 'AI scores higher' : averageDiscrepancy < 0 ? 'Human scores higher' : 'Perfectly balanced'}
              </div>
            </div>
            
            <div className="text-center">
              <div className={`text-xl font-bold ${
                systemHealth.coverage === 'High' ? 'text-green-600' :
                systemHealth.coverage === 'Medium' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {systemHealth.coverage}
              </div>
              <div className="text-sm text-gray-600">Data Coverage</div>
              <div className="text-xs text-gray-500">{totalCandidates} candidates analyzed</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Average Discrepancy */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Discrepancy</CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${getDiscrepancyColor(averageDiscrepancy)}`}>
            {formatDiscrepancy(averageDiscrepancy)}
          </div>
          <p className="text-xs text-muted-foreground">
            How far apart AI and Human scores are on average
          </p>
        </CardContent>
      </Card>

      {/* AI Scores Higher */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">AI Scores Higher</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {aiHigherCount}
          </div>
          <p className="text-xs text-muted-foreground">
            AI is more optimistic than humans ({aiHigherPercentage.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>

      {/* Human Scores Higher */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Human Scores Higher</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {humanHigherCount}
          </div>
          <p className="text-xs text-muted-foreground">
            Humans are more generous than AI ({humanHigherPercentage.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>

      {/* Total Candidates */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalCandidates}
          </div>
          <p className="text-xs text-muted-foreground">
            Candidates reviewed by both AI and humans
          </p>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
