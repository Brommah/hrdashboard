# HR Dashboard - Resume Score Analysis

A modern Next.js dashboard that connects to your Notion database to track and analyze discrepancies between AI and Human resume scores.

## Features

- **Score Discrepancy Tracking**: Visual comparison of AI vs Human resume scores
- **Interactive Charts**: Scatter plot and histogram visualizations
- **Real-time Metrics**: Key statistics and trends
- **Candidate Overview**: Detailed table with score comparisons
- **Auto-refresh**: Automatic data updates every 5 minutes
- **Responsive Design**: Modern UI that works on all devices

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration and copy the API key
3. Share your HR database with the integration
4. Copy your database ID from the URL

### 3. Environment Variables

1. Copy the example environment file:
```bash
cp env.example .env.local
```

2. Fill in your Notion credentials in `.env.local`:
```env
NOTION_API_KEY=your_notion_integration_token_here
NOTION_DATABASE_ID=your_database_id_here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Database Schema

The dashboard expects your Notion database to have these properties:

| Property Name | Type | Description |
|--------------|------|-------------|
| Name | Title | Candidate name |
| AI Score | Number | AI-generated resume score (0-10) |
| Human Score | Number | Human reviewer score (0-10) |
| Status | Select | Current candidate status |
| Role | Select | Position role |
| Source | Select | How candidate was sourced |
| Date Added | Date | When candidate was added |

## Key Metrics

- **Average Discrepancy**: Mean difference between AI and Human scores
- **Score Distribution**: Frequency of different discrepancy values
- **Agreement Rate**: Percentage of candidates with matching scores
- **Bias Analysis**: Whether AI tends to score higher or lower than humans

## Visualizations

1. **Scatter Plot**: AI Score vs Human Score comparison with reference line
2. **Histogram**: Distribution of score discrepancies
3. **Metrics Cards**: Key statistics at a glance
4. **Candidate Table**: Detailed view sorted by largest discrepancies

## Development

### Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Tech Stack

- **Framework**: Next.js 14 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **Charts**: Recharts for data visualization
- **API Integration**: Notion SDK
- **UI Components**: Custom components with Radix UI primitives

## Troubleshooting

### Common Issues

1. **"Notion database configuration missing"**
   - Ensure `NOTION_API_KEY` and `NOTION_DATABASE_ID` are set in `.env.local`
   - Verify the integration has access to your database

2. **Empty data or charts not showing**
   - Check that your database has candidates with both AI Score and Human Score values
   - Ensure property names match exactly (case-sensitive)

3. **API errors**
   - Verify your Notion integration token is valid
   - Check that the database ID is correct
   - Ensure the integration has read permissions

### Getting Database ID

1. Open your Notion database in a browser
2. Copy the URL - it looks like: `https://notion.so/workspace/DATABASE_ID?v=...`
3. The DATABASE_ID is the 32-character string between the last `/` and `?`

## License

MIT License - feel free to use this for your HR analytics needs!
