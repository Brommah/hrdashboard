'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, Brain, AlertCircle, CheckCircle2, ExternalLink, ArrowUpDown, Calendar, Star } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  role: string;
  jobRole: string;
  aiScore: number;
  humanScore: number;
  aiStatus: string;
  interviewStatus?: string;
  status: string;
  dateAdded: string;
  linkedinProfile?: string;
  aiProcessedAt?: string;
  runAi: boolean;
}

interface OutstandingReviewsTabProps {
  candidates: Candidate[];
}

/**
 * Outstanding Reviews tab showing pending AI/Human reviews by role and hiring manager
 */
export function OutstandingReviewsTab({ candidates }: OutstandingReviewsTabProps) {
  const [sortBy, setSortBy] = useState<'aiScore' | 'date'>('aiScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedManagers, setSelectedManagers] = useState<string[]>(['Sergey', 'Ulad', 'Lynn']);

  // Role to Hiring Manager mapping
  const roleToManager = {
    'AI Engineer': 'Sergey',
    'AI Innovator': 'Sergey', 
    'Founder\'s Associate': 'Lynn',
    'PSE': 'Ulad',
    'Principal Fullstack Engineer': 'Sergey',
    'Operations Generalist': 'Lynn'
  };

  const allManagers = ['Sergey', 'Ulad', 'Lynn'];

  const toggleManager = (manager: string) => {
    setSelectedManagers(prev => 
      prev.includes(manager) 
        ? prev.filter(m => m !== manager)
        : [...prev, manager]
    );
  };

  // Categorize candidates by review status (only AI score >= 5)
  const reviewCategories = {
    pendingHumanReview: candidates.filter(c => 
      c.aiScore >= 5 && c.humanScore === 0
    ),
    bothCompleted: candidates.filter(c => 
      c.aiScore >= 5 && c.humanScore > 0
    ),
    needsAttention: candidates.filter(c => 
      c.aiScore >= 5 && c.humanScore > 0 && Math.abs(c.aiScore - c.humanScore) >= 3
    )
  };

  // Sorting function
  const sortCandidates = (candidateList: Candidate[]) => {
    return [...candidateList].sort((a, b) => {
      if (sortBy === 'aiScore') {
        const scoreA = a.aiScore;
        const scoreB = b.aiScore;
        return sortOrder === 'desc' ? scoreB - scoreA : scoreA - scoreB;
      } else {
        const dateA = new Date(a.dateAdded).getTime();
        const dateB = new Date(b.dateAdded).getTime();
        return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
      }
    });
  };

  // Group pending human reviews by role/manager with sorting
  const pendingByManager = reviewCategories.pendingHumanReview.reduce((acc: any, candidate) => {
    const role = candidate.jobRole || candidate.role;
    if (!role) return acc; // Skip candidates without roles
    const manager = roleToManager[role as keyof typeof roleToManager] || 'Unassigned';
    
    if (!acc[manager]) {
      acc[manager] = {};
    }
    if (!acc[manager][role]) {
      acc[manager][role] = [];
    }
    acc[manager][role].push(candidate);
    return acc;
  }, {});

  // Sort candidates within each role
  Object.keys(pendingByManager).forEach(manager => {
    Object.keys(pendingByManager[manager]).forEach(role => {
      pendingByManager[manager][role] = sortCandidates(pendingByManager[manager][role]);
    });
  });

  const getUrgencyBadge = (dateAdded: string) => {
    const daysAgo = Math.floor((Date.now() - new Date(dateAdded).getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo >= 2) return <Badge variant="destructive">Urgent ({daysAgo}d)</Badge>;
    if (daysAgo >= 1) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">1 day</Badge>;
    return <Badge variant="secondary">Today</Badge>;
  };

  const getScoreDiscrepancyBadge = (aiScore: number, humanScore: number) => {
    const diff = Math.abs(aiScore - humanScore);
    if (diff >= 4) return <Badge variant="destructive">High Discrepancy ({diff})</Badge>;
    if (diff >= 2) return <Badge variant="outline" className="border-yellow-500 text-yellow-700">Moderate ({diff})</Badge>;
    return <Badge variant="secondary">Aligned ({diff})</Badge>;
  };

  const CandidateCard = ({ candidate, showManager = false }: { candidate: Candidate, showManager?: boolean }) => {
    const handleReview = () => {
      // Open Notion page for the candidate
      const notionUrl = `https://notion.so/${candidate.id.replace(/-/g, '')}`;
      window.open(notionUrl, '_blank');
    };

    return (
      <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                {candidate.linkedinProfile && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => window.open(candidate.linkedinProfile, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="outline">{candidate.jobRole || candidate.role}</Badge>
                {showManager && (
                  <Badge variant="secondary">
                    {roleToManager[(candidate.jobRole || candidate.role) as keyof typeof roleToManager] || 'Unassigned'}
                  </Badge>
                )}
                {getUrgencyBadge(candidate.dateAdded)}
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Brain className="h-4 w-4" />
                  <span>AI: {candidate.aiScore || 'Pending'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <User className="h-4 w-4" />
                  <span>Human: {candidate.humanScore || 'Pending'}</span>
                </div>
              </div>
            </div>
            <Button 
              size="sm" 
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              onClick={handleReview}
            >
              Review
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Outstanding Reviews</h2>
        <p className="text-gray-600">Track human review backlog by role and hiring manager</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-600" />
              <span>Pending Human Review</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{reviewCategories.pendingHumanReview.length}</div>
            <p className="text-xs text-gray-600">High-quality candidates (AI ≥5) ready for review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Both Complete</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{reviewCategories.bothCompleted.length}</div>
            <p className="text-xs text-gray-600">High-quality reviews completed (AI ≥5)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>Needs Attention</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reviewCategories.needsAttention.length}</div>
            <p className="text-xs text-gray-600">AI-Human mismatch, needs calibration</p>
          </CardContent>
        </Card>
      </div>

      {/* Manager Filter & Sorting Controls */}
      {reviewCategories.pendingHumanReview.length > 0 && (
        <div className="space-y-4">
          {/* Manager Filter */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-slate-600" />
                  <span className="font-medium text-slate-900">Filter by Manager:</span>
                </div>
                <div className="flex items-center space-x-2">
                  {allManagers.map(manager => (
                    <Button
                      key={manager}
                      variant={selectedManagers.includes(manager) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleManager(manager)}
                      className={selectedManagers.includes(manager) ? 'bg-gradient-to-r from-slate-600 to-slate-700' : ''}
                    >
                      {manager}
                      {selectedManagers.includes(manager) && (
                        <span className="ml-1 text-xs">
                          ({Object.values(pendingByManager[manager] || {}).reduce((sum: number, candidates: any) => sum + candidates.length, 0)})
                        </span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sorting Controls */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ArrowUpDown className="h-4 w-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Sort candidates by:</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={sortBy === 'aiScore' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (sortBy === 'aiScore') {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy('aiScore');
                        setSortOrder('desc');
                      }
                    }}
                    className={sortBy === 'aiScore' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : ''}
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Quality {sortBy === 'aiScore' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </Button>
                  <Button
                    variant={sortBy === 'date' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (sortBy === 'date') {
                        setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                      } else {
                        setSortBy('date');
                        setSortOrder('desc');
                      }
                    }}
                    className={sortBy === 'date' ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : ''}
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    Urgency {sortBy === 'date' && (sortOrder === 'desc' ? '↓' : '↑')}
                  </Button>
                </div>
              </div>
              <div className="mt-2 text-xs text-blue-700">
                {sortBy === 'aiScore' 
                  ? `Prioritizing by quality (${sortOrder === 'desc' ? 'best candidates first' : 'review borderline cases first'})`
                  : `Prioritizing by urgency (${sortOrder === 'desc' ? 'newest applications first' : 'clear oldest backlog first'})`
                }
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending Human Reviews by Manager */}
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-gray-900">Pending Human Reviews by Hiring Manager</h3>
        
        {Object.entries(pendingByManager)
          .filter(([manager]) => selectedManagers.includes(manager))
          .map(([manager, roles]) => (
          <Card key={manager}>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>{manager}</span>
                <Badge variant="outline">
                  {Object.values(roles as any).reduce((sum: number, candidates: any) => sum + candidates.length, 0)} candidates
                </Badge>
              </CardTitle>
            <CardDescription>
              High-quality candidates (AI ≥5) awaiting human review
            </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(roles as any).map(([role, candidates]) => (
                  <div key={role}>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                      <span>{role}</span>
                      <Badge variant="secondary">{(candidates as any).length} pending</Badge>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(candidates as any).map((candidate: Candidate) => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* High Discrepancy Cases */}
      {reviewCategories.needsAttention.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span>High Discrepancy Cases ({reviewCategories.needsAttention.length})</span>
            </CardTitle>
            <CardDescription>
              Candidates with significant differences between AI and Human scores (3+ points)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewCategories.needsAttention.map(candidate => (
                <Card key={candidate.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{candidate.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="outline">{candidate.jobRole || candidate.role}</Badge>
                          {getScoreDiscrepancyBadge(candidate.aiScore, candidate.humanScore)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                          <span>AI: {candidate.aiScore}</span>
                          <span>Human: {candidate.humanScore}</span>
                          <span>Diff: {Math.abs(candidate.aiScore - candidate.humanScore)}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          const notionUrl = `https://notion.so/${candidate.id.replace(/-/g, '')}`;
                          window.open(notionUrl, '_blank');
                        }}
                      >
                        Review Case
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
