# Integration Recipes

This document provides practical recipes for integrating the Ritual Script Library with other services in a larger ecosystem.

## Table of Contents

1. [Ritual Event Orchestrator Integration](#ritual-event-orchestrator-integration)
2. [Live Session Co-Pilot Integration](#live-session-co-pilot-integration)
3. [Notification Service Integration](#notification-service-integration)
4. [Analytics Platform Integration](#analytics-platform-integration)
5. [Authentication & Authorization](#authentication--authorization)
6. [Webhook Integration](#webhook-integration)
7. [Real-time Updates](#real-time-updates)

---

## Ritual Event Orchestrator Integration

### Use Case
The orchestrator manages scheduled ritual events and needs to fetch and render appropriate scripts based on event details.

### Recipe

```typescript
// In ritual-event-orchestrator service

async function prepareRitualScript(event: RitualEvent) {
  // 1. Fetch the script
  const script = await fetch(
    `${SCRIPT_LIBRARY_URL}/api/scripts/${event.scriptKey}`
  ).then(r => r.json())

  // 2. Build context from event details
  const context = {
    communityName: event.community.name,
    facilitator: event.facilitator.name,
    moonPhase: event.moonPhase,
    groupSize: event.participants.length > 20 ? 'large' :
               event.participants.length > 5 ? 'medium' : 'small',
    location: event.isOnline ? 'online' : 'offline',
    date: event.date.toISOString(),
    dayOfWeek: event.date.toLocaleDateString('en-US', { weekday: 'long' }),
    nextGathering: event.nextEvent?.date.toLocaleDateString() || 'TBD'
  }

  // 3. Render the script
  const rendered = await fetch(
    `${SCRIPT_LIBRARY_URL}/api/scripts/${event.scriptKey}/render`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contextJson: context })
    }
  ).then(r => r.json())

  return rendered
}
```

### Event-Driven Integration

Subscribe to script events to keep orchestrator in sync:

```typescript
import { events } from '@ritual-script-library/events'

// When a script is updated, refresh cached event data
events.on('script.updated', async (event) => {
  await refreshCachedEventsUsingScript(event.scriptKey)
})
```

---

## Live Session Co-Pilot Integration

### Use Case
The co-pilot provides real-time guidance during a live ritual session, adapting the script based on participant count and engagement.

### Recipe

```typescript
// In live-session-co-pilot service

class RitualSessionManager {
  private scriptLibraryClient: ScriptLibraryClient

  async startSession(sessionId: string, scriptKey: string, initialContext: any) {
    // 1. Load initial script
    const rendered = await this.scriptLibraryClient.renderScript(
      scriptKey,
      initialContext
    )

    // 2. Break into segments for progressive delivery
    for (const segment of rendered.segments) {
      await this.displaySegment(sessionId, segment)
      await this.waitForCompletion(sessionId, segment)
    }
  }

  async adaptToContext(sessionId: string, scriptKey: string, newContext: any) {
    // Re-render with updated context (e.g., participant count changed)
    const rendered = await this.scriptLibraryClient.renderScript(
      scriptKey,
      newContext
    )

    await this.updateLiveSession(sessionId, rendered)
  }
}
```

### Real-time Context Updates

```typescript
// Track participant count and re-render if threshold crossed
socket.on('participant:joined', async () => {
  const newCount = session.participants.length

  // Re-render if we crossed a group size threshold
  if (crossedThreshold(session.lastGroupSize, newCount)) {
    const newContext = { ...session.context, groupSize: getGroupSize(newCount) }
    await adaptToContext(session.id, session.scriptKey, newContext)
  }
})
```

---

## Notification Service Integration

### Use Case
Send notifications when scripts are rendered or updated.

### Recipe

```typescript
// src/lib/adapters/slack-notification.ts

import { INotificationAdapter, NotificationPayload } from './types'

export class SlackNotificationAdapter implements INotificationAdapter {
  constructor(private webhookUrl: string) {}

  async send(payload: NotificationPayload): Promise<void> {
    await fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: payload.title,
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: `*${payload.title}*\n${payload.message}` }
          }
        ]
      })
    })
  }

  async sendBatch(payloads: NotificationPayload[]): Promise<void> {
    for (const payload of payloads) {
      await this.send(payload)
    }
  }
}

// Register the adapter
import { adapters } from '@/lib/adapters/registry'

adapters.setNotificationAdapter(
  new SlackNotificationAdapter(process.env.SLACK_WEBHOOK_URL!)
)

// Use in event handlers
import { events } from '@/lib/events'

events.on('script.rendered', async (event) => {
  await adapters.getNotificationAdapter().send({
    title: 'Script Rendered',
    message: `${event.scriptKey} was rendered for ${event.communityId}`,
    metadata: { scriptKey: event.scriptKey }
  })
})
```

---

## Analytics Platform Integration

### Use Case
Track script usage and send metrics to an external analytics platform (e.g., Segment, Mixpanel).

### Recipe

```typescript
// src/lib/adapters/segment-analytics.ts

import { IAnalyticsAdapter, AnalyticsEvent } from './types'
import { Analytics } from '@segment/analytics-node'

export class SegmentAnalyticsAdapter implements IAnalyticsAdapter {
  private analytics: Analytics

  constructor(writeKey: string) {
    this.analytics = new Analytics({ writeKey })
  }

  async track(event: AnalyticsEvent): Promise<void> {
    await this.analytics.track({
      userId: event.userId,
      event: event.eventName,
      properties: {
        ...event.properties,
        communityId: event.communityId
      },
      timestamp: event.timestamp
    })
  }

  async trackBatch(events: AnalyticsEvent[]): Promise<void> {
    for (const event of events) {
      await this.track(event)
    }
  }

  async identify(userId: string, properties: Record<string, any>): Promise<void> {
    await this.analytics.identify({
      userId,
      traits: properties
    })
  }
}

// Register and use
import { adapters } from '@/lib/adapters/registry'
import { events } from '@/lib/events'

adapters.setAnalyticsAdapter(
  new SegmentAnalyticsAdapter(process.env.SEGMENT_WRITE_KEY!)
)

events.on('script.rendered', async (event) => {
  await adapters.getAnalyticsAdapter().track({
    eventName: 'Script Rendered',
    userId: event.communityId,
    communityId: event.communityId,
    properties: {
      scriptKey: event.scriptKey,
      selectedVariant: event.selectedVariant,
      renderDuration: event.renderDuration
    }
  })
})
```

---

## Authentication & Authorization

### Use Case
Secure API endpoints with JWT authentication and community-based authorization.

### Recipe

```typescript
// src/middleware/auth.ts

import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'

export interface AuthContext {
  userId: string
  communityId: string
  roles: string[]
}

export async function authenticate(request: NextRequest): Promise<AuthContext> {
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')

  if (!token) {
    throw new Error('No token provided')
  }

  const decoded = verify(token, process.env.JWT_SECRET!) as AuthContext

  return decoded
}

export function authorize(context: AuthContext, requiredRole: string): boolean {
  return context.roles.includes(requiredRole) || context.roles.includes('admin')
}

// Use in API routes
import { handleApiError, ApiErrors } from '@/lib/api-error'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticate(request)

    if (!authorize(auth, 'script.create')) {
      throw ApiErrors.forbidden('Insufficient permissions')
    }

    // Enforce community isolation
    const body = await request.json()
    body.communityId = auth.communityId // Override with authenticated community

    // ... rest of handler
  } catch (error) {
    return handleApiError(error)
  }
}
```

---

## Webhook Integration

### Use Case
Allow external systems to receive webhooks when scripts are created, updated, or rendered.

### Recipe

```typescript
// src/lib/webhooks.ts

import { events } from './events'
import { logger } from './logger'

interface WebhookSubscription {
  url: string
  events: string[]
  secret: string
}

class WebhookManager {
  private subscriptions: WebhookSubscription[] = []

  subscribe(subscription: WebhookSubscription) {
    this.subscriptions.push(subscription)
  }

  async notify(eventType: string, payload: any) {
    const relevantSubs = this.subscriptions.filter(sub =>
      sub.events.includes(eventType)
    )

    for (const sub of relevantSubs) {
      try {
        await fetch(sub.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': this.sign(payload, sub.secret)
          },
          body: JSON.stringify({
            event: eventType,
            data: payload,
            timestamp: new Date().toISOString()
          })
        })
      } catch (error) {
        logger.error('Webhook delivery failed', {
          url: sub.url,
          eventType,
          error: error instanceof Error ? error.message : String(error)
        })
      }
    }
  }

  private sign(payload: any, secret: string): string {
    const crypto = require('crypto')
    return crypto
      .createHmac('sha256', secret)
      .update(JSON.stringify(payload))
      .digest('hex')
  }
}

export const webhooks = new WebhookManager()

// Register webhook listeners
events.on('script.created', async (event) => {
  await webhooks.notify('script.created', event)
})

events.on('script.rendered', async (event) => {
  await webhooks.notify('script.rendered', event)
})
```

---

## Real-time Updates

### Use Case
Provide real-time updates to clients when scripts are modified during collaborative editing.

### Recipe

```typescript
// Using Server-Sent Events (SSE)

// src/app/api/scripts/[key]/subscribe/route.ts

export async function GET(
  request: NextRequest,
  { params }: { params: { key: string } }
) {
  const { key } = params

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      // Send initial connection message
      controller.enqueue(encoder.encode('data: {"type":"connected"}\n\n'))

      // Subscribe to script updates
      const unsubscribe = events.on('script.updated', (event) => {
        if (event.scriptKey === key) {
          const data = JSON.stringify({
            type: 'update',
            changes: event.changes
          })
          controller.enqueue(encoder.encode(`data: ${data}\n\n`))
        }
      })

      // Cleanup on connection close
      request.signal.addEventListener('abort', () => {
        unsubscribe()
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  })
}

// Client-side usage
const eventSource = new EventSource(`/api/scripts/${scriptKey}/subscribe`)

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data)
  if (data.type === 'update') {
    refreshScript(data.changes)
  }
}
```

---

## Best Practices

### 1. Error Handling
Always handle API errors gracefully:

```typescript
try {
  const script = await fetchScript(key)
} catch (error) {
  if (error.status === 404) {
    // Handle not found
  } else if (error.status === 500) {
    // Retry or fallback
  }
}
```

### 2. Caching
Cache rendered scripts when context is stable:

```typescript
const cacheKey = `script:${scriptKey}:${hashContext(context)}`
const cached = await cache.get(cacheKey)

if (cached) return cached

const rendered = await renderScript(scriptKey, context)
await cache.set(cacheKey, rendered, { ttl: 3600 })

return rendered
```

### 3. Rate Limiting
Implement rate limiting for public APIs:

```typescript
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s')
})

export async function POST(request: NextRequest) {
  const { success } = await ratelimit.limit(request.ip)

  if (!success) {
    return new Response('Too many requests', { status: 429 })
  }

  // ... rest of handler
}
```

### 4. Monitoring
Track integration health with metrics:

```typescript
import { metrics, MetricNames } from '@/lib/metrics'

const result = await metrics.measureAsync(
  'integration.render_script',
  async () => await renderScript(key, context),
  { integration: 'orchestrator' }
)
```

---

## Sample Integration Projects

### Minimal Node.js Client

```typescript
import fetch from 'node-fetch'

class RitualScriptClient {
  constructor(private baseUrl: string) {}

  async renderScript(key: string, context: Record<string, any>) {
    const response = await fetch(
      `${this.baseUrl}/api/scripts/${key}/render`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contextJson: context })
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to render: ${response.statusText}`)
    }

    return response.json()
  }
}

// Usage
const client = new RitualScriptClient('http://localhost:3000')
const rendered = await client.renderScript('new-moon-intention-setting', {
  communityName: 'Sacred Circle',
  facilitator: 'Elena'
})

console.log(rendered.fullText)
```

---

## Support

For integration questions or issues:
- Email: hilia10@ezweb.ne.jp
- GitHub: goodmonk06/community-ritual-script-library
