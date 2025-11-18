# Phase 3 Overview: Ritual Script Library

## Purpose Statement

The **Community Ritual Script Library** serves as a centralized, parameterized template engine for managing and rendering ritual ceremony scripts within an AI-driven community ecosystem. It solves the problem of **script reusability and context-aware customization** for various community gathering types (new moon, full moon, daily practices, etc.) by providing:

1. **Template-based script management** with variable substitution
2. **Context-aware variant selection** based on group size, location, moon phase, etc.
3. **API-first design** for integration with ritual orchestration and live session management services
4. **Deterministic rendering** without requiring AI at runtime

This repository acts as a **foundational building block** in a larger "civilization OS" by providing consistent, reproducible ritual scripts that can be adapted to any community context.

## Existing Features (Pre-Phase 3)

✅ **Core Domain Model**
- RitualScript: Main entity with key, title, type, and description
- RitualScriptSegment: Ordered segments (opening, transition, core, closing, blessing)
- RitualScriptVariant: Context-specific adaptations

✅ **Template Rendering Engine**
- Simple {{variable}} substitution syntax
- Variant selection by condition matching (most specific wins)
- Script composition from multiple segments

✅ **REST API**
- CRUD operations for scripts, segments, and variants
- Rendering endpoint (POST /api/scripts/:key/render)
- Zod validation and centralized error handling

✅ **Web UI**
- Browse and create scripts
- Edit segments with live preview
- Context-based rendering demonstration

✅ **Infrastructure**
- Next.js 14 fullstack with App Router
- PostgreSQL + Prisma ORM
- Docker and Docker Compose setup
- Basic test coverage for template renderer

## Current Limitations

❌ **Limited Domain Richness**
- No support for script collections or categories
- No usage tracking or analytics
- No tagging or search capabilities
- No version history or snapshots

❌ **Missing Extensibility**
- No plugin system or adapters
- Hard-coded notification/event handling
- No external integration points

❌ **Insufficient Observability**
- Basic console logging only
- No metrics or performance tracking
- No structured logging for production

❌ **Incomplete Test Coverage**
- Only template renderer has tests
- No API integration tests
- No database tests or fixtures

❌ **Limited Documentation**
- No architecture diagrams
- No integration recipes
- No detailed domain notes

## Phase 3 Implementation Plan

### 1. Domain Deepening 🎯

**New Entities:**
- `RitualCollection`: Group related scripts together (e.g., "Full Moon Ceremony Suite")
- `RitualUsageLog`: Track when and how scripts are rendered (analytics)
- `RitualTag`: Categorize scripts by theme, tradition, or purpose
- `RitualSnapshot`: Version history for scripts (audit trail)
- `RitualFavorite`: User/community bookmarks for quick access

**Enhanced Relationships:**
- Scripts → Collections (many-to-many)
- Scripts → Tags (many-to-many)
- Scripts → Snapshots (one-to-many, versioning)
- Scripts → UsageLogs (one-to-many, analytics)

### 2. Extensibility Layer 🔌

**Adapter Interfaces:**
- `INotificationAdapter`: Send notifications when scripts are rendered
- `IAnalyticsAdapter`: Track usage metrics to external systems
- `IStorageAdapter`: Alternative storage backends (S3, etc.)
- `IAuditAdapter`: Audit trail logging

**Event System:**
- Domain events (ScriptCreated, ScriptRendered, SegmentUpdated)
- Event handlers with extensible registration
- Type-safe event payloads

### 3. Logging & Metrics 📊

**Structured Logging:**
- Context-aware logger with request IDs
- Log levels (debug, info, warn, error)
- JSON output for production parsing

**Metrics:**
- Script render count and duration
- API endpoint performance
- Variant selection frequency
- Popular scripts tracking

### 4. Comprehensive Test Coverage ✅

**Test Types:**
- Unit tests for all business logic
- Integration tests for API endpoints
- Database tests with test fixtures
- E2E tests for critical flows

**Test Infrastructure:**
- Test data factories
- Database seeding helpers
- Mock implementations of adapters

### 5. Rich Seed Data & Fixtures 🌱

**Demo Content:**
- 10+ realistic ritual scripts across all types
- Multiple collections ("Lunar Cycle Complete", "Daily Practices")
- Realistic tags and categories
- Usage logs showing analytics data
- Multiple communities with different preferences

### 6. Enhanced Documentation 📚

**New Documentation:**
- `docs/ARCHITECTURE.md`: System design and component overview
- `docs/DOMAIN_NOTES.md`: Deep dive into domain concepts
- `docs/INTEGRATION_RECIPES.md`: How to integrate with other services
- `docs/API_REFERENCE.md`: Complete API documentation
- `docs/EXTENSION_GUIDE.md`: How to add custom adapters

**Diagrams:**
- Entity-relationship diagrams (ASCII art)
- System architecture overview
- Request flow diagrams

### 7. Additional Vertical Slices 🎬

**New Complete Flows:**
- Collection management (create → add scripts → browse)
- Usage analytics (render scripts → view logs → generate insights)
- Tag-based search and filtering
- Script versioning and rollback

### 8. DX Improvements 🛠️

**CLI Tools:**
- Script for importing scripts from JSON/YAML
- Script for exporting scripts
- Database maintenance utilities
- Seed data generators

**Development Scripts:**
- `npm run typecheck`: TypeScript type checking
- `npm run format`: Code formatting with Prettier
- `npm run db:reset`: Reset and reseed database
- `npm run test:watch`: Watch mode for tests

## Success Criteria

✨ Repository size grows 10x+ in functionality and richness
✨ Multiple realistic end-to-end flows fully implemented
✨ Clean extension points for external integration
✨ Comprehensive test coverage (>80%)
✨ Production-ready logging and metrics
✨ Rich documentation for all use cases
✨ Ready to be composed with other ecosystem services

## Future Extensions (Phase 4+)

- AI-assisted script generation from templates
- Multilingual support for global communities
- Script recommendation engine
- Real-time collaborative editing
- Audio/video embedding in script segments
- Mobile app integration
- Calendar integration for recurring rituals
