

# Architecture Documentation

## System Overview

The Community Ritual Script Library is a **fullstack TypeScript application** built as a parameterized template engine for managing and rendering ritual ceremony scripts. It follows a **layered architecture** with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────┐
│                     Presentation Layer                   │
│  (Next.js App Router, React Components, API Routes)     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                      Business Logic                      │
│   (Template Renderer, Variant Selector, Event Emitter)  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                     Data Access Layer                    │
│              (Prisma ORM, Database Models)               │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       Database Layer                     │
│                   (PostgreSQL Database)                  │
└─────────────────────────────────────────────────────────┘

              Cross-Cutting Concerns:
    ┌──────────────────────────────────────────┐
    │  Logging | Metrics | Validation | Events │
    │          Adapters | Error Handling        │
    └──────────────────────────────────────────┘
```

## Core Components

### 1. Domain Layer (`src/lib/`)

The domain layer contains pure business logic and core domain concepts.

#### Template Renderer (`template-renderer.ts`)
- **Purpose**: Deterministic rendering of ritual scripts with variable substitution
- **Key Functions**:
  - `renderTemplate()`: Replaces `{{variableName}}` placeholders with context values
  - `selectVariant()`: Chooses the most specific matching variant based on conditions
  - `renderScript()`: Renders all segments in order
  - `combineSegments()`: Assembles segments into final output

#### Events System (`events.ts`)
- **Purpose**: Domain event emitter for extensibility and integration
- **Event Types**:
  - `script.created`, `script.updated`, `script.deleted`
  - `script.rendered`
  - `segment.created`
  - `variant.selected`
  - `collection.created`, `collection.script_added`
  - `tag.created`, `tag.applied`
  - `snapshot.created`
- **Usage**: Other services can subscribe to events to react to domain changes

#### Logging (`logger.ts`)
- **Purpose**: Structured logging for observability
- **Levels**: debug, info, warn, error
- **Features**:
  - Contextual logging with request IDs
  - JSON output for production parsing
  - Pretty printing for development

#### Metrics (`metrics.ts`)
- **Purpose**: Performance monitoring and analytics
- **Metric Types**:
  - **Counter**: Incrementing values (e.g., script renders)
  - **Gauge**: Point-in-time values (e.g., active sessions)
  - **Histogram**: Distributions (e.g., render durations)
- **Features**:
  - Automatic duration measurement
  - Label support for dimensionality
  - Statistical aggregation

### 2. Adapters Layer (`src/lib/adapters/`)

The adapters layer provides extension points for external integrations.

#### Adapter Interfaces (`types.ts`)
- `INotificationAdapter`: Send notifications
- `IAnalyticsAdapter`: Track analytics events
- `IStorageAdapter`: File storage operations
- `IAuditAdapter`: Audit trail logging
- `ISearchAdapter`: Full-text search

#### Default Implementations (`implementations.ts`)
- **ConsoleNotificationAdapter**: Logs notifications to console
- **ConsoleAnalyticsAdapter**: Logs analytics to console
- **InMemoryStorageAdapter**: Stores files in memory
- **InMemoryAuditAdapter**: Stores audit logs in memory
- **InMemorySearchAdapter**: Simple text search in memory

#### Adapter Registry (`registry.ts`)
- Centralized dependency injection container
- Swap implementations at runtime
- Default to stub implementations for development

### 3. API Layer (`src/app/api/`)

RESTful API endpoints following Next.js App Router conventions.

#### Scripts API
```
GET    /api/scripts              - List all scripts
POST   /api/scripts              - Create a script
GET    /api/scripts/:key         - Get a specific script
PUT    /api/scripts/:key         - Update a script
DELETE /api/scripts/:key         - Delete a script
POST   /api/scripts/:key/render  - Render a script with context
```

#### Segments API
```
POST   /api/scripts/:key/segments        - Create a segment
PUT    /api/scripts/:key/segments/:id    - Update a segment
DELETE /api/scripts/:key/segments/:id    - Delete a segment
```

#### Variants API
```
POST   /api/scripts/:key/variants        - Create a variant
```

#### Request/Response Flow
```
Request → Validation (Zod) → Business Logic → Database → Response
                ↓                                    ↓
           Error Handling ←──────────────────── Metrics/Logging
```

### 4. Data Layer (Prisma + PostgreSQL)

#### Entity-Relationship Diagram

```
RitualScript
├── segments (1:N)     → RitualScriptSegment
├── variants (1:N)     → RitualScriptVariant
├── usageLogs (1:N)    → RitualUsageLog
├── snapshots (1:N)    → RitualSnapshot
├── scriptTags (M:N)   → ScriptTag → RitualTag
└── collectionScripts (M:N) → CollectionScript → RitualCollection

RitualCollection
└── collectionScripts (M:N) → CollectionScript → RitualScript

RitualTag
└── scriptTags (M:N) → ScriptTag → RitualScript
```

#### Key Models

**RitualScript** (Core Entity)
- Stores ritual script metadata
- Status: draft, published, archived
- Supports visibility (public/private)
- Tracks author and estimated duration

**RitualScriptSegment** (Ordered Components)
- Segments are ordered by `orderIndex`
- Types: opening, transition, core, closing, blessing
- Template markdown with variable placeholders
- Variable schema in `variablesJson`

**RitualScriptVariant** (Context Adaptations)
- Conditions stored as JSON (e.g., `{location: "online", groupSize: "large"}`)
- Variants selected by specificity matching
- Multiple variants can exist per script

**RitualCollection** (Grouping)
- Groups related scripts (e.g., "Lunar Cycle Complete")
- Many-to-many relationship via `CollectionScript`
- Scripts ordered within collections

**RitualUsageLog** (Analytics)
- Tracks every script render
- Stores context, selected variant, and duration
- Enables usage analytics and insights

**RitualSnapshot** (Version History)
- Immutable snapshots of script state
- Versioned for audit trail
- Full script data stored as JSON

**RitualTag** (Categorization)
- Flexible tagging system
- Many-to-many with scripts
- Supports colors for UI

### 5. Validation Layer (`src/lib/validation.ts`)

All API inputs validated using **Zod** schemas:

- `createScriptSchema`: Validates script creation
- `updateScriptSchema`: Validates script updates
- `createSegmentSchema`: Validates segment creation
- `createVariantSchema`: Validates variant creation
- `renderScriptSchema`: Validates rendering context

Validation occurs **before** business logic execution.

### 6. Error Handling (`src/lib/api-error.ts`)

Centralized error handling with consistent error responses:

- **ApiError**: Custom error class with status codes
- **handleApiError()**: Converts all error types to consistent format
- **Error Types Handled**:
  - Zod validation errors → 400
  - Prisma unique constraint → 409
  - Prisma not found → 404
  - Generic errors → 500

### 7. UI Layer (`src/app/`)

Server-side rendered React components using Next.js App Router:

- `/` - Home page with introduction
- `/scripts` - Browse all scripts
- `/scripts/new` - Create new script
- `/scripts/:key` - Edit script and segments
- `/scripts/:key/preview` - Preview rendered script

## Data Flow

### Script Creation Flow

```
User → UI Form → POST /api/scripts
                      ↓
              Validate (Zod Schema)
                      ↓
              Check uniqueness (Prisma)
                      ↓
              Create in database
                      ↓
              Emit script.created event
                      ↓
              Return created script
```

### Script Rendering Flow

```
Client → POST /api/scripts/:key/render {contextJson}
                    ↓
         Validate context (Zod)
                    ↓
         Fetch script + segments + variants (Prisma)
                    ↓
         Select best matching variant (Business Logic)
                    ↓
         Render each segment with context
                    ↓
         Combine segments into full text
                    ↓
         Log usage to RitualUsageLog (Analytics)
                    ↓
         Emit script.rendered event
                    ↓
         Return rendered output
```

## Extension Points

### 1. Event Handlers

Subscribe to domain events to react to changes:

```typescript
import { events } from '@/lib/events'

events.on('script.rendered', async (event) => {
  // Send notification
  // Update analytics dashboard
  // Trigger external workflow
})
```

### 2. Custom Adapters

Implement adapter interfaces for external integrations:

```typescript
import { INotificationAdapter } from '@/lib/adapters/types'
import { adapters } from '@/lib/adapters/registry'

class SlackNotificationAdapter implements INotificationAdapter {
  async send(payload: NotificationPayload) {
    // Send to Slack
  }
}

adapters.setNotificationAdapter(new SlackNotificationAdapter())
```

### 3. Middleware

Add custom logic in API routes:

```typescript
// Track metrics
metrics.counter(MetricNames.API_REQUEST, 1, {
  endpoint: '/api/scripts',
  method: 'GET'
})

// Add request context to logs
logger.setDefaultContext({ requestId: generateId() })
```

## Performance Considerations

### Database Indexes

Indexes added for common query patterns:
- `communityId` (for multi-tenancy)
- `ritualType` (for filtering)
- `status` (for published/draft filtering)
- `createdAt` (for sorting)

### Caching Strategy (Future)

Potential caching layers:
- **Redis**: Cache rendered scripts by context hash
- **CDN**: Cache static script listings
- **In-memory**: Cache frequently used variants

### Async Operations

- Event handlers execute in parallel
- Metrics collection is non-blocking
- Logging is asynchronous in production

## Security Considerations

### Input Validation

- All API inputs validated with Zod
- SQL injection prevented by Prisma ORM
- XSS protection via React escaping

### Access Control (Future)

- Community-based isolation via `communityId`
- Author-based permissions
- Public/private script visibility

### Audit Trail

- Usage logs track all renders
- Snapshots provide version history
- Audit adapter logs all mutations

## Deployment Architecture

```
┌────────────┐     ┌─────────────┐     ┌──────────────┐
│   Client   │────▶│  Next.js    │────▶│  PostgreSQL  │
│  Browser   │     │  App Server │     │   Database   │
└────────────┘     └─────────────┘     └──────────────┘
                         │
                         │ (optional)
                         ▼
                   ┌──────────────┐
                   │  Redis Cache │
                   └──────────────┘
```

### Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `NODE_ENV`: production | development | test
- `NEXT_PUBLIC_API_URL`: Public API URL

## Testing Strategy

### Unit Tests
- Template renderer logic
- Variant selection algorithm
- Event system
- Metrics calculation

### Integration Tests
- API endpoints with database
- Full render flow
- Error handling

### Test Infrastructure
- In-memory database for tests
- Test data factories
- Mock adapters

## Future Enhancements

1. **GraphQL API** for flexible querying
2. **Real-time subscriptions** for collaborative editing
3. **AI-assisted generation** from templates
4. **Multi-language support** for global communities
5. **Mobile apps** for iOS/Android
6. **Calendar integration** for recurring rituals
7. **Analytics dashboard** for usage insights
8. **Recommendation engine** for script suggestions
