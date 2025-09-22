import { NextResponse } from 'next/server';

/**
 * GET /api/test-data
 * Generate sample data to test the dashboard functionality
 */
export async function GET() {
  // Sample candidates with both AI and Human scores for testing
  const testCandidates = [
    {
      id: 'test-1',
      name: 'John Smith',
      dateAdded: '2024-01-15',
      status: 'In Review',
      location: 'San Francisco, CA',
      source: 'LinkedIn',
      resume: 'john_smith_resume.pdf',
      priority: 'High',
      jobRole: 'AI Engineer',
      role: 'AI Engineer',
      linkedinProfile: 'https://linkedin.com/in/johnsmith',
      aiScore: 8,
      humanScore: 6,
      passedAiFilter: true,
      passedHumanFilter: true,
      hotCandidate: true,
      caInbound: '',
      caOutbound: '',
      ifInbound: '',
      date1stInterview: '',
      date2ndInterview: '',
      date3rdInterview: '',
      weekFromStart: 'Week 1',
      interviewStatus: 'Scheduled',
      exploratoryCall: '',
      techInterview: '',
      ceoInterview: '',
      aiPriority: 'High',
      aiProcessedAt: '2024-01-15',
      aiStatus: 'processed',
      runAi: true,
      zapier: ''
    },
    {
      id: 'test-2',
      name: 'Sarah Johnson',
      dateAdded: '2024-01-16',
      status: 'Company Rejected',
      location: 'New York, NY',
      source: 'Wellfound',
      resume: 'sarah_johnson_resume.pdf',
      priority: 'Medium',
      jobRole: 'AI Engineer',
      role: 'AI Engineer',
      linkedinProfile: 'https://linkedin.com/in/sarahjohnson',
      aiScore: 4,
      humanScore: 7,
      passedAiFilter: false,
      passedHumanFilter: true,
      hotCandidate: false,
      caInbound: '',
      caOutbound: '',
      ifInbound: '',
      date1stInterview: '',
      date2ndInterview: '',
      date3rdInterview: '',
      weekFromStart: 'Week 2',
      interviewStatus: 'Rejected',
      exploratoryCall: '',
      techInterview: '',
      ceoInterview: '',
      aiPriority: 'Low',
      aiProcessedAt: '2024-01-16',
      aiStatus: 'processed',
      runAi: true,
      zapier: ''
    },
    {
      id: 'test-3',
      name: 'Mike Chen',
      dateAdded: '2024-01-17',
      status: 'Approved',
      location: 'Seattle, WA',
      source: 'Referral',
      resume: 'mike_chen_resume.pdf',
      priority: 'High',
      jobRole: 'AI Engineer',
      role: 'AI Engineer',
      linkedinProfile: 'https://linkedin.com/in/mikechen',
      aiScore: 9,
      humanScore: 9,
      passedAiFilter: true,
      passedHumanFilter: true,
      hotCandidate: true,
      caInbound: '',
      caOutbound: '',
      ifInbound: '',
      date1stInterview: '2024-01-20',
      date2ndInterview: '',
      date3rdInterview: '',
      weekFromStart: 'Week 1',
      interviewStatus: 'Scheduled',
      exploratoryCall: 'Completed',
      techInterview: 'Scheduled',
      ceoInterview: '',
      aiPriority: 'High',
      aiProcessedAt: '2024-01-17',
      aiStatus: 'processed',
      runAi: true,
      zapier: ''
    },
    {
      id: 'test-4',
      name: 'Anna Rodriguez',
      dateAdded: '2024-01-18',
      status: 'In Review',
      location: 'Austin, TX',
      source: 'Indeed',
      resume: 'anna_rodriguez_resume.pdf',
      priority: 'Medium',
      jobRole: 'Founder\'s Associate',
      role: 'Founder\'s Associate',
      linkedinProfile: 'https://linkedin.com/in/annarodriguez',
      aiScore: 6,
      humanScore: 8,
      passedAiFilter: false,
      passedHumanFilter: true,
      hotCandidate: false,
      caInbound: '',
      caOutbound: '',
      ifInbound: '',
      date1stInterview: '',
      date2ndInterview: '',
      date3rdInterview: '',
      weekFromStart: 'Week 1',
      interviewStatus: 'Pending',
      exploratoryCall: '',
      techInterview: '',
      ceoInterview: '',
      aiPriority: 'Medium',
      aiProcessedAt: '2024-01-18',
      aiStatus: 'processed',
      runAi: true,
      zapier: ''
    },
    {
      id: 'test-5',
      name: 'David Kim',
      dateAdded: '2024-01-19',
      status: 'In Review',
      location: 'Boston, MA',
      source: 'Company Website',
      resume: 'david_kim_resume.pdf',
      priority: 'Low',
      jobRole: 'AI Engineer',
      role: 'AI Engineer',
      linkedinProfile: 'https://linkedin.com/in/davidkim',
      aiScore: 3,
      humanScore: 5,
      passedAiFilter: false,
      passedHumanFilter: false,
      hotCandidate: false,
      caInbound: '',
      caOutbound: '',
      ifInbound: '',
      date1stInterview: '',
      date2ndInterview: '',
      date3rdInterview: '',
      weekFromStart: 'Week 1',
      interviewStatus: 'Not Started',
      exploratoryCall: '',
      techInterview: '',
      ceoInterview: '',
      aiPriority: 'Low',
      aiProcessedAt: '2024-01-19',
      aiStatus: 'processed',
      runAi: true,
      zapier: ''
    }
  ];

  // Calculate score analysis for test data
  const validCandidates = testCandidates.filter(
    candidate => candidate.aiScore > 0 && candidate.humanScore > 0
  );

  const discrepancies = validCandidates.map(candidate => 
    candidate.aiScore - candidate.humanScore
  );

  const aiHigherCount = discrepancies.filter(d => d > 0).length;
  const humanHigherCount = discrepancies.filter(d => d < 0).length;
  const equalScoresCount = discrepancies.filter(d => d === 0).length;

  const scoreAnalysis = {
    averageDiscrepancy: discrepancies.reduce((sum, d) => sum + d, 0) / discrepancies.length,
    maxDiscrepancy: Math.max(...discrepancies),
    minDiscrepancy: Math.min(...discrepancies),
    totalCandidates: validCandidates.length,
    aiHigherCount,
    humanHigherCount,
    equalScoresCount,
  };

  return NextResponse.json({
    candidates: testCandidates,
    scoreAnalysis,
    totalCount: testCandidates.length,
    message: 'Test data generated successfully'
  });
}
