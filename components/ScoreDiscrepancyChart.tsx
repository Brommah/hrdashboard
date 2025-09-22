'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

interface ScoreDiscrepancyChartProps {
  candidates: Array<{
    id: string;
    name: string;
    aiScore: number;
    humanScore: number;
    status: string;
  }>;
}

/**
 * Chart component to visualize AI vs Human score discrepancies
 */
export function ScoreDiscrepancyChart({ candidates }: ScoreDiscrepancyChartProps) {
  // Filter candidates with valid scores
  const validCandidates = candidates.filter(
    candidate => candidate.aiScore > 0 && candidate.humanScore > 0
  );

  // Prepare data for scatter plot
  const scatterData = validCandidates.map(candidate => ({
    x: candidate.humanScore,
    y: candidate.aiScore,
    name: candidate.name,
    discrepancy: candidate.aiScore - candidate.humanScore,
    status: candidate.status,
  }));

  // Prepare data for discrepancy histogram
  const discrepancyBuckets = [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5].map(bucket => ({
    discrepancy: bucket,
    count: validCandidates.filter(candidate => {
      const diff = candidate.aiScore - candidate.humanScore;
      return Math.floor(diff) === bucket;
    }).length,
  }));

  // Custom tooltip for scatter plot
  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">Human Score: {data.x}</p>
          <p className="text-sm text-gray-600">AI Score: {data.y}</p>
          <p className="text-sm text-gray-600">
            Discrepancy: {data.discrepancy > 0 ? '+' : ''}{data.discrepancy}
          </p>
          <p className="text-sm text-gray-600">Status: {data.status}</p>
        </div>
      );
    }
    return null;
  };

  // Color coding for scatter points based on discrepancy
  const getPointColor = (discrepancy: number) => {
    if (discrepancy > 1) return '#ef4444'; // Red for AI much higher
    if (discrepancy > 0) return '#f97316'; // Orange for AI higher
    if (discrepancy === 0) return '#10b981'; // Green for equal
    if (discrepancy > -1) return '#3b82f6'; // Blue for Human slightly higher
    return '#8b5cf6'; // Purple for Human much higher
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Scatter Plot: AI Score vs Human Score */}
      <Card>
        <CardHeader>
          <CardTitle>AI vs Human Score Comparison</CardTitle>
          <CardDescription>
            Each point represents a candidate. Points above the diagonal line indicate AI scored higher.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="Human Score" 
                domain={[0, 10]}
                label={{ value: 'Human Score', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="AI Score" 
                domain={[0, 10]}
                label={{ value: 'AI Score', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<ScatterTooltip />} />
              <Scatter dataKey="y">
                {scatterData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getPointColor(entry.discrepancy)} />
                ))}
              </Scatter>
              {/* Diagonal reference line (y = x) */}
              <line 
                x1="0%" 
                y1="100%" 
                x2="100%" 
                y2="0%" 
                stroke="#94a3b8" 
                strokeDasharray="5,5"
                strokeWidth={2}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Histogram: Discrepancy Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Score Discrepancy Distribution</CardTitle>
          <CardDescription>
            Frequency of AI Score - Human Score differences. Positive values mean AI scored higher.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={discrepancyBuckets}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="discrepancy" 
                label={{ value: 'Score Discrepancy (AI - Human)', position: 'insideBottom', offset: -5 }}
              />
              <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
              <Tooltip 
                formatter={(value, name) => [value, 'Candidates']}
                labelFormatter={(label) => `Discrepancy: ${label > 0 ? '+' : ''}${label}`}
              />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
