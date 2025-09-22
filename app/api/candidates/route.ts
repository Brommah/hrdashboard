import { NextResponse } from 'next/server';
import { getCandidates, calculateScoreDiscrepancy, calculateWeeklyTrends } from '@/lib/notion';

/**
 * GET /api/candidates
 * Fetch all candidates from Notion database with score analysis
 */
export async function GET() {
  try {
    const candidates = await getCandidates();
    const scoreAnalysis = calculateScoreDiscrepancy(candidates);
    const weeklyTrends = calculateWeeklyTrends(candidates);
    
    return NextResponse.json({
      candidates,
      scoreAnalysis,
      weeklyTrends,
      totalCount: candidates.length,
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    
    if (error instanceof Error && error.message.includes('NOTION_DATABASE_ID')) {
      return NextResponse.json(
        { error: 'Notion database configuration missing' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}
