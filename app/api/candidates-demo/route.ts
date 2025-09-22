import { NextResponse } from 'next/server';
import { getCandidates, calculateScoreDiscrepancy } from '@/lib/notion';

/**
 * GET /api/candidates-demo
 * Demo endpoint that adds sample human scores to show dashboard functionality
 */
export async function GET() {
  try {
    const candidates = await getCandidates();
    
    // Add sample human scores to first 10 candidates for demo purposes
    const demoScores = [8, 6, 9, 5, 7, 8, 4, 9, 6, 7];
    
    const candidatesWithHumanScores = candidates.map((candidate, index) => {
      if (index < 10 && candidate.aiScore > 0) {
        return {
          ...candidate,
          humanScore: demoScores[index] || 0
        };
      }
      return candidate;
    });
    
    const scoreAnalysis = calculateScoreDiscrepancy(candidatesWithHumanScores);
    
    return NextResponse.json({
      candidates: candidatesWithHumanScores,
      scoreAnalysis,
      totalCount: candidatesWithHumanScores.length,
      message: 'Demo data with sample human scores added to first 10 candidates'
    });
  } catch (error) {
    console.error('Error fetching demo candidates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch demo candidates' },
      { status: 500 }
    );
  }
}
