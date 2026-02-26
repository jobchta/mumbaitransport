# MumbaiLocal

AI-powered Mumbai transport alerts with real-time disruption updates.

## Features

- 🚨 **Real-time Alerts** - Web search + AI extraction for Mumbai transport news
- 🚇 **All Lines** - Western, Central, Harbour, Metro, Monorail
- 📊 **Live Status** - Track delays and disruptions
- 🔍 **Station Search** - Find stations with crowd levels
- 🌙 **Dark Mode** - Easy on the eyes

## Tech Stack

- **Next.js 16** - App Router
- **z-ai-web-dev-sdk** - AI & Web Search
- **Tailwind CSS** - Styling
- **shadcn/ui** - Components

## Getting Started

```bash
bun install
bun run dev
```

Open http://localhost:3000

## How It Works

1. API searches web for Mumbai transport news
2. AI extracts disruption details (line, severity, description)
3. Frontend displays alerts in real-time
4. Zero database - pure RAM storage

## Deployment

Deploy to Vercel for free:

```bash
vercel
```

## License

MIT
