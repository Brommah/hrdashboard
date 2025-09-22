'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCards } from '@/components/MetricsCards';
import { ScoreDiscrepancyChart } from '@/components/ScoreDiscrepancyChart';
import { CandidateTable } from '@/components/CandidateTable';
import { RefreshCw, AlertCircle } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  dateAdded: string;
  status: string;
  location?: string;
  source: string;
  resume?: string;
  priority?: string;
  jobRole: string;
  role: string;
  linkedinProfile?: string;
  aiScore: number;
  humanScore: number;
  passedAiFilter: boolean;
  passedHumanFilter: boolean;
  hotCandidate?: boolean;
  caInbound?: string;
  caOutbound?: string;
  ifInbound?: string;
  date1stInterview?: string;
  date2ndInterview?: string;
  date3rdInterview?: string;
  weekFromStart: string;
  interviewStatus?: string;
  exploratoryCall?: string;
  techInterview?: string;
  ceoInterview?: string;
  aiPriority?: string;
  aiProcessedAt?: string;
  aiStatus: string;
  runAi: boolean;
  zapier?: string;
}

interface ScoreAnalysis {
  averageDiscrepancy: number;
  maxDiscrepancy: number;
  minDiscrepancy: number;
  totalCandidates: number;
  aiHigherCount: number;
  humanHigherCount: number;
  equalScoresCount: number;
}

/**
 * Demo page showing dashboard functionality with sample human scores
 */
export default function DemoPage() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [scoreAnalysis, setScoreAnalysis] = useState<ScoreAnalysis>({
    averageDiscrepancy: 0,
    maxDiscrepancy: 0,
    minDiscrepancy: 0,
    totalCandidates: 0,
    aiHigherCount: 0,
    humanHigherCount: 0,
    equalScoresCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  /**
   * Fetch demo candidates data from API
   */
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/candidates-demo');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCandidates(data.candidates);
      setScoreAnalysis(data.scoreAnalysis);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching demo candidates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCandidates();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-700">Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={fetchCandidates}
              className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">HR Dashboard - DEMO</h1>
            <p className="text-gray-600 mt-1">
              AI vs Human Resume Score Analysis (with sample data)
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <p className="text-sm text-gray-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
            <button
              onClick={fetchCandidates}
              disabled={loading}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Demo Notice */}
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-800">Demo Mode</CardTitle>
            <CardDescription className="text-blue-600">
              This demo shows how the dashboard will look with real human scores. 
              Sample human scores have been added to the first 10 candidates from your Notion database.
            </CardDescription>
          </CardHeader>
        </Card>

        {loading && !candidates.length ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-gray-600">Loading demo data...</span>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Metrics Cards */}
            <MetricsCards scoreAnalysis={scoreAnalysis} />

            {/* Charts */}
            <ScoreDiscrepancyChart candidates={candidates} />

            {/* Candidate Table */}
            <CandidateTable candidates={candidates} />
          </div>
        )}
      </div>
    </div>
  );
}
