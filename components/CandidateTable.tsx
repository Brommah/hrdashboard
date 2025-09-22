'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Candidate {
  id: string;
  name: string;
  aiScore: number;
  humanScore: number;
  status: string;
  role: string;
  source: string;
  dateAdded: string;
}

interface CandidateTableProps {
  candidates: Candidate[];
}

/**
 * Badge component for status display
 */
const StatusBadge = ({ status }: { status: string }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'company rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'in progress':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  return (
    <Badge variant="secondary" className={getStatusColor(status)}>
      {status}
    </Badge>
  );
};

/**
 * Score comparison component
 */
const ScoreComparison = ({ aiScore, humanScore }: { aiScore: number; humanScore: number }) => {
  const discrepancy = aiScore - humanScore;
  const getDiscrepancyColor = (diff: number) => {
    if (diff > 1) return 'text-red-600';
    if (diff > 0) return 'text-orange-600';
    if (diff === 0) return 'text-green-600';
    if (diff > -1) return 'text-blue-600';
    return 'text-purple-600';
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="text-sm">
        <span className="font-medium">AI:</span> {aiScore}
      </div>
      <div className="text-sm">
        <span className="font-medium">Human:</span> {humanScore}
      </div>
      <div className={`text-sm font-medium ${getDiscrepancyColor(discrepancy)}`}>
        ({discrepancy > 0 ? '+' : ''}{discrepancy})
      </div>
    </div>
  );
};

/**
 * Table component displaying candidate details with score discrepancies
 */
export function CandidateTable({ candidates }: CandidateTableProps) {
  // Filter and sort candidates with valid scores, sorted by discrepancy
  const validCandidates = candidates
    .filter(candidate => candidate.aiScore > 0 && candidate.humanScore > 0)
    .sort((a, b) => Math.abs(b.aiScore - b.humanScore) - Math.abs(a.aiScore - a.humanScore));

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Candidate Score Analysis</CardTitle>
        <CardDescription>
          Candidates sorted by score discrepancy (largest differences first)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Name</th>
                <th className="text-left p-3 font-medium">Role</th>
                <th className="text-left p-3 font-medium">Scores (AI/Human)</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Source</th>
                <th className="text-left p-3 font-medium">Date Added</th>
              </tr>
            </thead>
            <tbody>
              {validCandidates.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-muted-foreground">
                    No candidates with both AI and Human scores found.
                  </td>
                </tr>
              ) : (
                validCandidates.map((candidate) => (
                  <tr key={candidate.id} className="border-b hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium">{candidate.name}</div>
                    </td>
                    <td className="p-3">
                      <Badge variant="outline">{candidate.role}</Badge>
                    </td>
                    <td className="p-3">
                      <ScoreComparison 
                        aiScore={candidate.aiScore} 
                        humanScore={candidate.humanScore} 
                      />
                    </td>
                    <td className="p-3">
                      <StatusBadge status={candidate.status} />
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {candidate.source}
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">
                      {formatDate(candidate.dateAdded)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
