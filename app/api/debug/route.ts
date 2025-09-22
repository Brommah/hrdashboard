import { NextResponse } from 'next/server';
import { notion } from '@/lib/notion';

/**
 * GET /api/debug
 * Debug endpoint to see raw Notion properties
 */
export async function GET() {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID;
    if (!databaseId) {
      throw new Error('NOTION_DATABASE_ID environment variable is not set');
    }

    const response = await notion.databases.query({
      database_id: databaseId,
      page_size: 5, // Just get a few records for debugging
    });

    // Return raw properties for debugging
    const debugData = response.results.map((page: any) => {
      const properties = page.properties;
      return {
        id: page.id,
        propertyNames: Object.keys(properties),
        aiScoreProperty: properties['AI Score'],
        humanScoreProperty: properties['Human Score'],
        // Also check for alternative names
        aiScoreAlt: properties['Ai Score'] || properties['ai score'] || properties['AiScore'],
        humanScoreAlt: properties['Human score'] || properties['human score'] || properties['HumanScore'],
      };
    });

    return NextResponse.json({
      debugData,
      totalResults: response.results.length,
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
