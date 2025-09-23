/**
 * Centralized candidate filtering logic to ensure consistency across all components
 */

export interface Candidate {
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

/**
 * Standard filtering functions used across all components
 */
export const candidateFilters = {
  /**
   * All candidates with valid basic data
   */
  valid: (candidates: Candidate[]) => 
    candidates.filter(c => 
      c.name && 
      c.dateAdded && 
      (c.jobRole || c.role)
    ),

  /**
   * Candidates with AI scores (processed by AI)
   */
  withAiScore: (candidates: Candidate[]) =>
    candidateFilters.valid(candidates).filter(c => c.aiScore > 0),

  /**
   * Candidates with both AI and Human scores (fully reviewed)
   */
  fullyReviewed: (candidates: Candidate[]) =>
    candidateFilters.valid(candidates).filter(c => c.aiScore > 0 && c.humanScore > 0),

  /**
   * High-quality candidates worth human review (AI >= 5)
   */
  highQuality: (candidates: Candidate[]) =>
    candidateFilters.withAiScore(candidates).filter(c => c.aiScore >= 5),

  /**
   * Candidates pending human review (AI >= 5, no human score)
   */
  pendingHumanReview: (candidates: Candidate[]) =>
    candidateFilters.highQuality(candidates).filter(c => c.humanScore === 0),

  /**
   * Candidates with high score discrepancy (needs attention)
   */
  highDiscrepancy: (candidates: Candidate[]) =>
    candidateFilters.fullyReviewed(candidates).filter(c => 
      Math.abs(c.aiScore - c.humanScore) >= 3
    ),
};

/**
 * Get role name consistently across components
 */
export const getRoleName = (candidate: Candidate): string => {
  return candidate.jobRole || candidate.role || 'No Role';
};

/**
 * Get source name consistently across components
 */
export const getSourceName = (candidate: Candidate): string | null => {
  const source = candidate.source;
  if (!source || source.trim() === '') return null;
  
  const normalized = source.toLowerCase().trim();
  
  if (normalized.includes('join')) return 'Join';
  if (normalized.includes('wellfound')) return 'Wellfound';
  if (normalized.includes('linkedin')) return 'LinkedIn';
  if (normalized.includes('company website') || normalized.includes('website')) return 'Company Website';
  if (normalized.includes('referral')) return 'Referral';
  if (normalized.includes('outbound')) return 'Outbound';
  
  return source; // Return original if no normalization needed
};
