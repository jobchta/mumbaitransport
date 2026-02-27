/**
 * Mumbai Transport Alerts API
 *
 * This API fetches real-time transport disruption alerts using:
 * 1. Web search for current Mumbai transport news
 * 2. AI extraction to parse disruptions from news articles
 *
 * Features:
 * - Rate limiting to prevent abuse
 * - Proper typed responses
 * - Graceful error handling with fallbacks
 */

import { NextResponse } from 'next/server';
import type { Alert, AlertsApiResponse, LineStatus, WebSearchResult, LlmExtractedAlert, LineId } from '@/types';
import { CACHE_CONFIG, RATE_LIMIT_CONFIG, LINE_COLORS } from '@/lib/utils/constants';

// Force dynamic rendering for Vercel
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(clientId: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);

  // Clean up expired entries
  if (entry && now > entry.resetTime) {
    rateLimitStore.delete(clientId);
  }

  const currentEntry = rateLimitStore.get(clientId);

  if (!currentEntry) {
    // New client
    rateLimitStore.set(clientId, {
      count: 1,
      resetTime: now + RATE_LIMIT_CONFIG.WINDOW_MS,
    });
    return {
      allowed: true,
      remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS - 1,
      resetIn: RATE_LIMIT_CONFIG.WINDOW_MS,
    };
  }

  if (currentEntry.count >= RATE_LIMIT_CONFIG.MAX_REQUESTS) {
    return {
      allowed: false,
      remaining: 0,
      resetIn: currentEntry.resetTime - now,
    };
  }

  currentEntry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_CONFIG.MAX_REQUESTS - currentEntry.count,
    resetIn: currentEntry.resetTime - now,
  };
}

// ============================================================================
// Cache Management
// ============================================================================

interface CacheEntry {
  alerts: Alert[];
  timestamp: number;
}

let cache: CacheEntry | null = null;

function getCachedAlerts(): Alert[] | null {
  if (!cache) return null;

  const now = Date.now();
  if (now - cache.timestamp > CACHE_CONFIG.ALERTS_TTL_MS) {
    cache = null;
    return null;
  }

  return cache.alerts;
}

function setCachedAlerts(alerts: Alert[]): void {
  cache = {
    alerts,
    timestamp: Date.now(),
  };
}

function clearCache(): void {
  cache = null;
}

// ============================================================================
// Alert Processing
// ============================================================================

// Search queries for Mumbai transport alerts
const SEARCH_QUERIES = [
  'Mumbai local train delay today 2025',
  'Western Railway Mumbai disruption today announcement',
  'Central Railway Mumbai train delay today official',
  'Harbour line Mumbai train problem today news',
  'Mumbai Metro service disruption today',
  'Mumbai local train mega block Sunday',
];

/**
 * Map line name from LLM output to LineId
 */
function mapLineToId(line: string): LineId {
  const lineMap: Record<string, LineId> = {
    western: 'western',
    central: 'central',
    harbour: 'harbour',
    harbor: 'harbour',
    metro: 'metro-1',
    monorail: 'monorail',
    trans: 'trans-harbour',
    best: 'general',
  };

  const normalized = line.toLowerCase().trim();
  return lineMap[normalized] || 'general';
}

/**
 * Validate and normalize alert severity
 */
function validateSeverity(severity: string | undefined): Alert['severity'] {
  const validSeverities = ['critical', 'high', 'medium', 'low'] as const;
  return validSeverities.includes(severity as Alert['severity'])
    ? (severity as Alert['severity'])
    : 'medium';
}

/**
 * Validate LLM response and extract alerts
 */
function parseLlmResponse(content: string): LlmExtractedAlert[] {
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return [];

  try {
    const parsed = JSON.parse(jsonMatch[0]);
    return Array.isArray(parsed.alerts) ? parsed.alerts : [];
  } catch {
    return [];
  }
}

/**
 * Transform LLM alerts to typed Alert objects
 */
function transformAlerts(llmAlerts: LlmExtractedAlert[]): Alert[] {
  return llmAlerts.map((alert, index): Alert => ({
    id: `alert_${Date.now()}_${index}`,
    title: alert.title?.trim() || 'Transport Alert',
    description: alert.description?.trim() || '',
    line: (alert.line?.trim() || 'General') as Alert['line'],
    lineId: mapLineToId(alert.line || 'general'),
    severity: validateSeverity(alert.severity),
    status: 'active',
    lastUpdated: new Date().toISOString(),
  }));
}

// ============================================================================
// API Handlers
// ============================================================================

/**
 * GET /api/alerts
 * Fetch current transport alerts
 */
export async function GET(request: Request): Promise<NextResponse<AlertsApiResponse>> {
  // Rate limiting
  const clientId = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = checkRateLimit(clientId);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        data: { alerts: [], lineStatuses: [], stats: { alertCount: 0 } },
        error: `Rate limit exceeded. Retry in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
      },
      { status: 429 }
    );
  }

  // Check cache first
  const cachedAlerts = getCachedAlerts();
  if (cachedAlerts) {
    return NextResponse.json({
      success: true,
      cached: true,
      timestamp: new Date().toISOString(),
      data: {
        alerts: cachedAlerts,
        lineStatuses: calculateLineStatuses(cachedAlerts),
        stats: { alertCount: cachedAlerts.length },
      },
    });
  }

  try {
    // Dynamic import to avoid build-time issues
    const ZAI = (await import('z-ai-web-dev-sdk')).default;
    const zai = await ZAI.create();

    // Fetch search results
    const searchPromises = SEARCH_QUERIES.map(query =>
      zai.functions.invoke('web_search', { query, num: CACHE_CONFIG.SEARCH_RESULTS_PER_QUERY })
        .then(result => (Array.isArray(result) ? result : []))
        .catch(() => [])
    );

    const searchResults = await Promise.all(searchPromises);
    const allResults: WebSearchResult[] = searchResults.flat();

    if (allResults.length === 0) {
      return NextResponse.json({
        success: true,
        timestamp: new Date().toISOString(),
        data: { alerts: [], lineStatuses: [], stats: { alertCount: 0 } },
      });
    }

    // Deduplicate by URL
    const uniqueResults = Array.from(
      new Map(allResults.map(r => [r.url, r])).values()
    ).slice(0, CACHE_CONFIG.MAX_ALERTS);

    // Extract alerts using LLM
    const prompt = `Extract ONLY current, active Mumbai transport disruptions from these news items. Be strict - ignore routine announcements.

News items:
${uniqueResults.map((r, i) => `[${i + 1}] ${r.name} - ${r.snippet}`).join('\n')}

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

Only include actual disruptions happening NOW. Return empty alerts array if no real disruptions.`;

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a Mumbai transport news analyzer. Only report actual, current disruptions.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
    });

    const content = completion.choices?.[0]?.message?.content || '';
    const llmAlerts = parseLlmResponse(content);
    const alerts = transformAlerts(llmAlerts);

    // Update cache
    setCachedAlerts(alerts);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: {
        alerts,
        lineStatuses: calculateLineStatuses(alerts),
        stats: { alertCount: alerts.length },
      },
    });
  } catch (error) {
    console.error('Alert fetch error:', error);

    // Return cached data on error if available
    const cachedData = getCachedAlerts();

    return NextResponse.json({
      success: false,
      timestamp: new Date().toISOString(),
      data: {
        alerts: cachedData || [],
        lineStatuses: cachedData ? calculateLineStatuses(cachedData) : [],
        stats: { alertCount: cachedData?.length || 0 },
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

/**
 * POST /api/alerts
 * Force refresh the cache
 */
export async function POST(request: Request): Promise<NextResponse<AlertsApiResponse>> {
  // Rate limiting with stricter limits for POST
  const clientId = request.headers.get('x-forwarded-for') || 'unknown';
  const rateLimit = checkRateLimit(`post_${clientId}`);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        timestamp: new Date().toISOString(),
        data: { alerts: [], lineStatuses: [], stats: { alertCount: 0 } },
        error: `Rate limit exceeded. Retry in ${Math.ceil(rateLimit.resetIn / 1000)} seconds.`,
      },
      { status: 429 }
    );
  }

  clearCache();
  return GET(request);
}

/**
 * Calculate line statuses from alerts
 */
function calculateLineStatuses(alerts: Alert[]): LineStatus[] {
  const statusMap = new Map<LineId, { status: LineStatus['status']; count: number }>();

  for (const alert of alerts) {
    const existing = statusMap.get(alert.lineId);
    if (!existing) {
      statusMap.set(alert.lineId, {
        status: alert.severity === 'critical' ? 'suspended' : 'delayed',
        count: 1,
      });
    } else {
      existing.count++;
      if (alert.severity === 'critical') {
        existing.status = 'suspended';
      }
    }
  }

  // Return status for all lines
  const allLines: LineId[] = ['western', 'central', 'harbour', 'trans-harbour', 'metro-1', 'metro-2a', 'metro-7', 'monorail'];

  return allLines.map(lineId => {
    const status = statusMap.get(lineId);
    return {
      lineId,
      status: status?.status || 'normal',
      alertCount: status?.count || 0,
    };
  });
}
