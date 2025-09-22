import { Client } from '@notionhq/client';

/**
 * Notion API client configuration
 */
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
  timeoutMs: 60000, // 60 second timeout for large datasets
});

/**
 * Candidate data structure based on the Notion database schema
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
 * Fetch all candidates from the Notion database
 */
export async function getCandidates(): Promise<Candidate[]> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID environment variable is not set');
    }

    // Fetch more records with pagination
    let allResults: any[] = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    // Calculate date range for exactly 4 weeks of data
    const today = new Date();
    const fourWeeksAgo = new Date();
    fourWeeksAgo.setDate(today.getDate() - 28); // Exactly 28 days ago
    
    const fourWeeksAgoISO = fourWeeksAgo.toISOString();
    console.log(`Fetching candidates from ${fourWeeksAgo.toDateString()} to ${today.toDateString()}`);

    while (hasMore && allResults.length < 1000) { // 4 weeks of data needs more records
      const response = await notion.databases.query({
        database_id: databaseId,
        filter: {
          or: [
            {
              property: 'Date Added',
              date: {
                after: fourWeeksAgoISO,
              },
            },
            {
              property: 'Date Added',
              date: {
                is_empty: true,
              },
            },
          ],
        },
        sorts: [
          {
            property: 'Date Added',
            direction: 'descending', // Get most recent first
          },
        ],
        start_cursor: startCursor,
        page_size: 100, // Maximum allowed by Notion API
      });

      allResults = allResults.concat(response.results);
      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    return allResults.map((page: any) => {
      const properties = page.properties;
      
      return {
        id: page.id,
        name: getPropertyValue(properties, 'Name', 'title') || '',
        dateAdded: getPropertyValue(properties, 'Date Added', 'date') || page.created_time,
        status: getPropertyValue(properties, 'Status', 'select') || '',
        location: getPropertyValue(properties, 'Location', 'rich_text') || '',
        source: getPropertyValue(properties, 'Source', 'select') || '',
        resume: getPropertyValue(properties, 'Resume', 'files') || '',
        priority: getPropertyValue(properties, 'Priority', 'select') || '',
        jobRole: getPropertyValue(properties, 'Job Role', 'select') || '',
        role: getPropertyValue(properties, 'Role', 'select') || '',
        linkedinProfile: getPropertyValue(properties, 'Linkedin Profile', 'url') || '',
        aiScore: getPropertyValue(properties, 'AI Score', 'number') || 0,
        humanScore: getPropertyValue(properties, 'Human Score', 'number') || 0,
        passedAiFilter: getPropertyValue(properties, 'Passed AI Filter', 'checkbox') || false,
        passedHumanFilter: getPropertyValue(properties, 'Passed Human Filter', 'checkbox') || false,
        hotCandidate: getPropertyValue(properties, 'Hot Candidate?', 'checkbox') || false,
        caInbound: getPropertyValue(properties, 'CA Inbound', 'rich_text') || '',
        caOutbound: getPropertyValue(properties, 'CA Outbound', 'rich_text') || '',
        ifInbound: getPropertyValue(properties, '[if inbound]', 'rich_text') || '',
        date1stInterview: getPropertyValue(properties, 'Date 1st Interview', 'date') || '',
        date2ndInterview: getPropertyValue(properties, 'Date 2nd Interview', 'date') || '',
        date3rdInterview: getPropertyValue(properties, 'Date 3rd Interview', 'date') || '',
        weekFromStart: getPropertyValue(properties, 'Week from start of process', 'select') || '',
        interviewStatus: getPropertyValue(properties, 'Interview Status', 'select') || '',
        exploratoryCall: getPropertyValue(properties, 'Exploratory Call', 'select') || '',
        techInterview: getPropertyValue(properties, 'Tech Interview', 'select') || '',
        ceoInterview: getPropertyValue(properties, 'CEO Interview', 'select') || '',
        aiPriority: getPropertyValue(properties, 'Ai Priority', 'rich_text') || '',
        aiProcessedAt: getPropertyValue(properties, 'AI Processed At', 'date') || '',
        aiStatus: getPropertyValue(properties, 'AI Status', 'select') || '',
        runAi: getPropertyValue(properties, 'Run AI', 'checkbox') || false,
        zapier: getPropertyValue(properties, 'Zapier', 'rich_text') || '',
      };
    });
  } catch (error) {
    console.error('Error fetching candidates from Notion:', error);
    throw error;
  }
}

/**
 * Helper function to extract property values from Notion API response
 */
function getPropertyValue(properties: any, propertyName: string, type: string): any {
  const property = properties[propertyName];
  if (!property) return null;

  switch (type) {
    case 'title':
      return property.title?.[0]?.plain_text || '';
    case 'rich_text':
      return property.rich_text?.[0]?.plain_text || '';
    case 'number':
      return property.number || 0;
    case 'select':
      return property.select?.name || '';
    case 'multi_select':
      return property.multi_select?.map((item: any) => item.name) || [];
    case 'date':
      return property.date?.start || '';
    case 'checkbox':
      return property.checkbox || false;
    case 'url':
      return property.url || '';
    case 'files':
      return property.files?.[0]?.name || '';
    default:
      return null;
  }
}

/**
 * Calculate weekly trends for score discrepancy
 */
export function calculateWeeklyTrends(candidates: Candidate[]) {
  // Use ALL candidates with dates for volume trends
  const allCandidates = candidates.filter(candidate => candidate.dateAdded);
  
  // Separate set for score analysis (only those with both scores)
  const scoredCandidates = candidates.filter(
    candidate => candidate.aiScore > 0 && candidate.humanScore > 0 && candidate.dateAdded
  );

  console.log(`Processing ${allCandidates.length} total candidates and ${scoredCandidates.length} with both scores for weekly trends`);

  // Generate exactly 4 weeks of buckets (most recent 4 weeks)
  const today = new Date();
  const weekBuckets = [];
  
  for (let i = 3; i >= 0; i--) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - (i * 7));
    // Set to Monday of that week
    const dayOfWeek = weekStart.getDay();
    const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    weekStart.setDate(diff);
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);
    
    weekBuckets.push({
      weekKey: weekStart.toISOString().split('T')[0],
      weekStart,
      weekEnd,
      allCandidates: [],
      scoredCandidates: []
    });
  }
  
  console.log(`Created 4 week buckets:`, weekBuckets.map(w => w.weekKey));

  // Assign candidates to the correct week buckets
  allCandidates.forEach(candidate => {
    const candidateDate = new Date(candidate.dateAdded);
    if (isNaN(candidateDate.getTime())) return;
    
    // Find which week bucket this candidate belongs to
    const bucket = weekBuckets.find(bucket => 
      candidateDate >= bucket.weekStart && candidateDate <= bucket.weekEnd
    );
    
    if (bucket) {
      bucket.allCandidates.push(candidate);
      
      // Also add to scored candidates if they have both scores
      if (candidate.aiScore > 0 && candidate.humanScore > 0) {
        bucket.scoredCandidates.push(candidate);
      }
    }
  });
  
  console.log(`Candidates per week:`, weekBuckets.map(w => `${w.weekKey}: ${w.allCandidates.length} total, ${w.scoredCandidates.length} scored`));

  // Calculate metrics for each week bucket
  const weeklyMetrics = weekBuckets.map(bucket => {
    const allCandidates = bucket.allCandidates;
    const scoredCandidates = bucket.scoredCandidates;
    
    // Calculate score discrepancies only for candidates with both scores
    const discrepancies = scoredCandidates.map((c: Candidate) => c.aiScore - c.humanScore);
    const absDiscrepancies = discrepancies.map(Math.abs);
    
    return {
      week: bucket.weekKey,
      date: bucket.weekStart,
      totalCandidates: allCandidates.length, // All candidates for volume
      scoredCandidates: scoredCandidates.length, // Candidates with both scores
      averageDiscrepancy: discrepancies.length > 0 ? discrepancies.reduce((sum, d) => sum + d, 0) / discrepancies.length : 0,
      averageAbsoluteDiscrepancy: absDiscrepancies.length > 0 ? absDiscrepancies.reduce((sum, d) => sum + d, 0) / absDiscrepancies.length : 0,
      aiHigherCount: discrepancies.filter(d => d > 0).length,
      humanHigherCount: discrepancies.filter(d => d < 0).length,
      equalCount: discrepancies.filter(d => d === 0).length,
      maxDiscrepancy: discrepancies.length > 0 ? Math.max(...discrepancies) : 0,
      minDiscrepancy: discrepancies.length > 0 ? Math.min(...discrepancies) : 0,
      aiAccuracy: discrepancies.length > 0 ? discrepancies.filter(d => Math.abs(d) <= 1).length / discrepancies.length * 100 : 0, // Within 1 point
    };
  });

  return weeklyMetrics;
}

/**
 * Calculate score discrepancy metrics
 */
export function calculateScoreDiscrepancy(candidates: Candidate[]) {
  const validCandidates = candidates.filter(
    candidate => candidate.aiScore > 0 && candidate.humanScore > 0
  );

  if (validCandidates.length === 0) {
    return {
      averageDiscrepancy: 0,
      maxDiscrepancy: 0,
      minDiscrepancy: 0,
      totalCandidates: 0,
      aiHigherCount: 0,
      humanHigherCount: 0,
      equalScoresCount: 0,
    };
  }

  const discrepancies = validCandidates.map(candidate => 
    candidate.aiScore - candidate.humanScore
  );

  const aiHigherCount = discrepancies.filter(d => d > 0).length;
  const humanHigherCount = discrepancies.filter(d => d < 0).length;
  const equalScoresCount = discrepancies.filter(d => d === 0).length;

  return {
    averageDiscrepancy: discrepancies.reduce((sum, d) => sum + d, 0) / discrepancies.length,
    maxDiscrepancy: Math.max(...discrepancies),
    minDiscrepancy: Math.min(...discrepancies),
    totalCandidates: validCandidates.length,
    aiHigherCount,
    humanHigherCount,
    equalScoresCount,
    discrepancies: discrepancies.map(Math.abs),
  };
}
