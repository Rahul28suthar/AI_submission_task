# Deep Research System

An AI-powered research system with observable reasoning, document context, and comprehensive cost tracking. Built with Next.js, PostgreSQL, and Vercel AI SDK.

## Features

### Core Functionality
- **AI-Powered Research**: Comprehensive multi-step research using GPT-5
- **Observable Reasoning**: Track each step of the research process in real-time
- **Document Upload**: Add custom context by uploading documents (.txt, .md, .pdf)
- **Research Continuation**: Build upon previous research with additional queries
- **Cost Tracking**: Monitor token usage and expenses for every research session

### User Experience
- **Real-time Updates**: Live polling to show research progress
- **History Management**: Access all past research sessions
- **Dark Theme**: Professional UI inspired by modern AI platforms
- **Responsive Design**: Works seamlessly on desktop and mobile

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **AI**: Vercel AI SDK v5 with GPT-5
- **Database**: PostgreSQL (Vercel Postgres)
- **Styling**: Tailwind CSS v4 with custom dark theme
- **UI Components**: shadcn/ui

## Database Schema

### Tables

**research_sessions**
- `id` (UUID, Primary Key)
- `query` (TEXT, Research query)
- `status` (TEXT, Status: running/completed/failed)
- `created_at`, `updated_at`, `completed_at` (TIMESTAMP)
- `total_tokens` (INTEGER, Total tokens used)
- `total_cost` (DECIMAL, Total cost in USD)
- `result_summary` (TEXT, Final summary)

**research_steps**
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key)
- `step_number` (INTEGER, Sequential step number)
- `step_type` (TEXT, Type of reasoning step)
- `content` (TEXT, Step content)
- `tokens_used` (INTEGER, Tokens for this step)
- `created_at` (TIMESTAMP)

**documents**
- `id` (UUID, Primary Key)
- `session_id` (UUID, Foreign Key, Optional)
- `filename` (TEXT, Original filename)
- `content` (TEXT, Document content)
- `file_size` (INTEGER, Size in bytes)
- `mime_type` (TEXT, File MIME type)
- `uploaded_at` (TIMESTAMP)

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- Vercel account (for AI Gateway and deployment)

### Installation

1. Clone and install dependencies:
```bash
npm install
```

2. Set up environment variables:
```env
# Database
POSTGRES_URL=your_postgresql_connection_string

# The Vercel AI Gateway is used by default (no API key needed)
# It provides access to OpenAI GPT-5, Anthropic Claude, and other models
```

3. Run database migrations:
```bash
# Execute the SQL scripts in /scripts folder
# They will be run automatically in v0, or manually via your PostgreSQL client
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

### Starting Research

1. Enter your research query in the main form
2. Optionally upload documents for additional context
3. Click "Start Research" to begin
4. Watch the research steps appear in real-time

### Continuing Research

1. Open any completed research session
2. Click "Continue Research"
3. Add your follow-up question or direction
4. The new session will include context from the previous research

### Cost Monitoring

- View aggregate statistics on the home page
- See per-session costs in the history list
- Track token usage for each research step
- Monitor average cost per session

## API Routes

### POST /api/research
Start a new research session with optional document uploads

### GET /api/research/[id]
Get research session details and steps

### POST /api/research/continue
Continue research from a previous session

### GET /api/research/history
Get list of all research sessions

## Cost Structure

The system uses GPT-5 via Vercel AI Gateway:
- Estimated cost: ~$0.01 per 1,000 tokens
- Typical research session: 2,000-4,000 tokens
- Average cost per session: $0.02-$0.04

Costs are tracked in real-time and stored in the database for historical analysis.

## Architecture

### Research Process Flow

1. User submits query with optional documents
2. Session created in database with "running" status
3. Documents processed and stored with session reference
4. AI research agent starts with:
   - Multi-step reasoning via AI SDK tools
   - Web search capabilities (simulated in demo)
   - Data analysis tools
5. Each reasoning step saved to database with token count
6. Session updated with final summary and costs
7. Status changed to "completed" or "failed"

### Key Design Decisions

- **Async Research**: Research runs in background to avoid timeout issues
- **Polling Updates**: Client polls every 2 seconds for real-time progress
- **Cost Calculation**: Token counts estimated during streaming for accuracy
- **Document Context**: Full document content passed to AI in prompt
- **Continuation Pattern**: Previous research context included in new sessions

## Deployment

This app is optimized for Vercel deployment:

```bash
vercel deploy
```

Environment variables and database will be configured automatically via Vercel integrations.

## Future Enhancements

- Real web search integration (Tavily, Exa, etc.)
- Export research to PDF/Markdown
- Team collaboration features
- Research templates
- Advanced cost analytics dashboard
- Citation tracking and source management
- Custom AI model selection

## License

MIT License - feel free to use this as a starting point for your research tools.

## Support

For issues or questions:
- Open an issue on GitHub
- Check the documentation
- Contact support at [your-email]

---

Built with ❤️ using v0, Next.js, and Vercel AI SDK
