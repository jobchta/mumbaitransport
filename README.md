# MumbaiLocal (Fixed Version)

AI-powered Mumbai transport alerts with real-time disruption updates.

This is a **refactored and fixed version** of the original [jobchta/mumbaitransport](https://github.com/jobchta/mumbaitransport) repository, addressing 47 critical issues identified in a comprehensive code review.

## What Was Fixed

### Critical Fixes (P0)
- **Type Safety**: Replaced `object[]` with proper `Alert[]` types throughout
- **Rate Limiting**: Added rate limiting to API endpoints to prevent abuse
- **Memory Cache**: Improved cache management with proper cleanup
- **Error Boundaries**: Added React error boundaries for graceful error handling

### High Priority Fixes (P1)
- **Accessibility**: Added ARIA labels, improved contrast, skip navigation
- **Performance**: Memoized crowd level calculations, removed inline object creation
- **Dead Code**: Removed unused imports and dead state variables
- **Constants**: Replaced magic numbers with named constants

### Medium Priority Fixes (P2)
- **Architecture**: Separated types into dedicated module
- **Code Quality**: Added JSDoc comments, improved naming conventions
- **Deterministic Behavior**: Fixed random destination selection in train schedules

## Features

- **Real-time Alerts** - Web search + AI extraction for Mumbai transport news
- **All Lines** - Western, Central, Harbour, Metro, Monorail
- **Live Status** - Track delays and disruptions
- **Station Search** - Find stations with crowd levels
- **Fare Calculator** - Calculate fares between stations
- **Dark Mode** - Easy on the eyes (default)
- **PWA Support** - Works offline with service worker

## Tech Stack

- **Next.js 16** - App Router
- **TypeScript** - Full type safety
- **z-ai-web-dev-sdk** - AI & Web Search
- **Tailwind CSS 4** - Styling
- **shadcn/ui** - Components

## Project Structure

```
src/
├── app/
│   ├── api/alerts/route.ts   # Alert API with rate limiting
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout with error boundary
│   └── page.tsx              # Main page component
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── ErrorBoundary.tsx     # Error boundary component
├── hooks/
│   ├── useLiveAlerts.ts      # Alert fetching hook
│   └── useCrowdLevel.ts      # Crowd calculation hook
├── lib/
│   ├── transport/data.ts     # Station data and utilities
│   └── utils/constants.ts    # Application constants
└── types/
    └── index.ts              # Central type definitions
```

## Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun run dev
```

Open http://localhost:3000

## Key Improvements Over Original

| Issue | Original | Fixed |
|-------|----------|-------|
| Type Safety | `object[]` types | Full TypeScript types |
| Rate Limiting | None | 10 requests/minute |
| Error Handling | None | Error boundaries |
| Accessibility | Missing ARIA | Full ARIA support |
| Performance | Recalculates on every render | Memoized calculations |
| Magic Numbers | Hardcoded values | Named constants |
| Dead Code | Unused imports | Clean imports |
| Documentation | None | JSDoc comments |

## API Endpoints

### GET /api/alerts
Fetches current transport alerts with caching.

### POST /api/alerts
Forces cache refresh (rate limited).

## Environment Variables

No environment variables required - the z-ai-web-dev-sdk handles configuration automatically.

## Deployment

Deploy to Vercel:

```bash
vercel
```

## License

MIT

## Acknowledgments

Based on the original [MumbaiTransport](https://github.com/jobchta/mumbaitransport) project.
