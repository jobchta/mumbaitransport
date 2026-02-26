import { NextResponse } from 'next/server'

// Force dynamic rendering - this is critical for Vercel deployment
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Dynamic import to avoid build-time issues
async function getZAI() {
  const ZAI = (await import('z-ai-web-dev-sdk')).default
  return ZAI.create()
}

// Cache for alerts
let cachedAlerts: object[] = []
let lastFetchTime = 0
const CACHE_TTL = 5 * 60 * 1000

// Search queries for Mumbai transport alerts
const SEARCH_QUERIES = [
  'Mumbai local train delay today 2025',
  'Western Railway Mumbai disruption today announcement',
  'Central Railway Mumbai train delay today official',
  'Harbour line Mumbai train problem today news',
  'Mumbai Metro service disruption today',
  'Mumbai local train mega block Sunday',
]

interface SearchResult {
  url: string
  name: string
  snippet: string
  host_name: string
}

export async function GET() {
  const now = Date.now()
  
  // Return cached data if available and fresh
  if (cachedAlerts.length > 0 && (now - lastFetchTime) < CACHE_TTL) {
    return NextResponse.json({
      success: true,
      cached: true,
      timestamp: new Date().toISOString(),
      data: {
        alerts: cachedAlerts,
        lineStatuses: [],
        stats: { alertCount: cachedAlerts.length }
      }
    })
  }

  try {
    const zai = await getZAI()
    const allResults: SearchResult[] = []
    
    // Parallel search with error handling
    const searches = SEARCH_QUERIES.map(q => 
      zai.functions.invoke('web_search', { query: q, num: 3 })
        .then(r => Array.isArray(r) ? r : [])
        .catch(() => [])
    )
    
    const results = await Promise.all(searches)
    results.forEach(r => allResults.push(...r))
    
    if (allResults.length === 0) {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: { alerts: [], lineStatuses: [], stats: { alertCount: 0 } }
      })
    }
    
    // Dedupe by URL
    const unique = Array.from(new Map(allResults.map(r => [r.url, r])).values()).slice(0, 12)
    
    // Extract with LLM
    const prompt = `Extract ONLY current, active Mumbai transport disruptions from these news items. Be strict - ignore routine announcements.

News items:
${unique.map((r, i) => `[${i+1}] ${r.name} - ${r.snippet}`).join('\n')}

Return JSON only:
{
  "alerts": [
    {
      "title": "Brief headline",
      "description": "What happened, impact",
      "line": "western|central|harbour|metro|general",
      "severity": "low|medium|high|critical"
    }
  ]
}

Only include actual disruptions happening NOW. Return empty alerts array if no real disruptions.`
    
    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a Mumbai transport news analyzer. Only report actual, current disruptions.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1
    })
    
    const content = completion.choices?.[0]?.message?.content || ''
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    
    let alerts: object[] = []
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        alerts = (parsed.alerts || []).map((a: {title?: string; description?: string; line?: string; severity?: string}, i: number) => ({
          id: `alert_${Date.now()}_${i}`,
          title: a.title || 'Transport Alert',
          description: a.description || '',
          line: a.line || 'general',
          lineId: mapLine(a.line || 'general'),
          severity: ['low', 'medium', 'high', 'critical'].includes(a.severity || '') ? a.severity : 'medium',
          status: 'active',
          lastUpdated: new Date().toISOString()
        }))
      } catch {
        // JSON parse error, return empty alerts
      }
    }
    
    cachedAlerts = alerts
    lastFetchTime = now
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: { alerts, lineStatuses: [], stats: { alertCount: alerts.length } }
    })
    
  } catch (error: unknown) {
    console.error('Alert fetch error:', error)
    
    // Return cached data on error, or empty if no cache
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      data: { 
        alerts: cachedAlerts, 
        lineStatuses: [], 
        stats: { alertCount: cachedAlerts.length } 
      }
    })
  }
}

export async function POST() {
  cachedAlerts = []
  lastFetchTime = 0
  return GET()
}

function mapLine(line: string): string {
  const map: Record<string, string> = {
    western: 'western', central: 'central', harbour: 'harbour',
    harbor: 'harbour', metro: 'metro-1', monorail: 'monorail',
    trans: 'trans-harbour', best: 'best'
  }
  return map[line.toLowerCase()] || 'general'
}
