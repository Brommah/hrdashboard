'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricsCards } from '@/components/MetricsCards';
import { ScoreDiscrepancyChart } from '@/components/ScoreDiscrepancyChart';
import { CandidateTable } from '@/components/CandidateTable';
import { WeeklyTrendsChart } from '@/components/WeeklyTrendsChart';
import { Sidebar } from '@/components/Sidebar';
import { RolePerformanceTab } from '@/components/RolePerformanceTab';
import { LeadSourcesTab } from '@/components/LeadSourcesTab';
import { InterviewPipelineTab } from '@/components/InterviewPipelineTab';
import { WeeklyKPIsTab } from '@/components/WeeklyKPIsTab';
import { CostAnalysisTab } from '@/components/CostAnalysisTab';
import { CandidateQualityTab } from '@/components/CandidateQualityTab';
import { HomeTab } from '@/components/HomeTab';
import { OutstandingReviewsTab } from '@/components/OutstandingReviewsTab';
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

/**
 * Main HR Dashboard page component
 */
export default function Dashboard() {
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
  const [weeklyTrends, setWeeklyTrends] = useState<WeeklyTrend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('home');

  /**
   * Fetch candidates data from API
   */
  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/candidates');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      setCandidates(data.candidates);
      setScoreAnalysis(data.scoreAnalysis);
      setWeeklyTrends(data.weeklyTrends || []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch candidates');
    } finally {
      setLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchCandidates();
  }, []);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(fetchCandidates, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <CardTitle className="text-red-700">Configuration Error</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p className="font-medium mb-2">To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Copy <code>env.example</code> to <code>.env.local</code></li>
                <li>Add your Notion API key to <code>NOTION_API_KEY</code></li>
                <li>Add your Notion database ID to <code>NOTION_DATABASE_ID</code></li>
                <li>Restart the development server</li>
              </ol>
            </div>
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

  const renderTabContent = () => {
    if (loading && !candidates.length) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            <span className="text-gray-600">Loading candidates...</span>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'home':
        return <HomeTab candidates={candidates} weeklyTrends={weeklyTrends} scoreAnalysis={scoreAnalysis} />;
      
      case 'outstanding-reviews':
        return <OutstandingReviewsTab candidates={candidates} />;
      
      case 'ai-vs-human':
        return (
          <div className="space-y-8">
            <MetricsCards scoreAnalysis={scoreAnalysis} />
            <WeeklyTrendsChart weeklyTrends={weeklyTrends} />
            <ScoreDiscrepancyChart candidates={candidates} />
            <CandidateTable candidates={candidates} />
          </div>
        );
      
      case 'lead-sources':
        return <LeadSourcesTab candidates={candidates} weeklyTrends={weeklyTrends} />;
      
      case 'role-performance':
        return <RolePerformanceTab candidates={candidates} weeklyTrends={weeklyTrends} />;
      
      case 'interview-pipeline':
        return <InterviewPipelineTab candidates={candidates} />;
      
      case 'weekly-kpis':
        return <WeeklyKPIsTab candidates={candidates} weeklyTrends={weeklyTrends} />;
      
      case 'cost-analysis':
        return <CostAnalysisTab candidates={candidates} />;
      
      
      case 'candidate-quality':
        return <CandidateQualityTab candidates={candidates} weeklyTrends={weeklyTrends} />;
      
      default:
        return <div>Tab not found</div>;
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex overflow-hidden">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-6 py-4 shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'home' && 'Executive Summary'}
                {activeTab === 'ai-vs-human' && 'AI vs Human Score Analysis'}
                {activeTab === 'lead-sources' && 'Lead Sources Performance'}
                {activeTab === 'role-performance' && 'Role Performance Analysis'}
                {activeTab === 'interview-pipeline' && 'Interview Pipeline'}
                {activeTab === 'weekly-kpis' && 'Weekly KPIs'}
                {activeTab === 'cost-analysis' && 'Cost Analysis'}
                {activeTab === 'candidate-quality' && 'Candidate Quality'}
              </h1>
              <p className="text-gray-600 mt-1">
                Team Growth Knowledge Base Analytics
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
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 transition-all duration-200 shadow-md"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
