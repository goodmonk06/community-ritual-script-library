# Community Ritual Script Library

A fullstack TypeScript application for managing and rendering parameterized ritual scripts for community gatherings, ceremonies, and daily practices.

毎朝のルーティン・満月ワーク・新月宣言など「儀式台本」をテンプレ＋AI補助で生成・管理するスクリプトライブラリ。

## Overview

The Ritual Script Library allows you to:

- **Create and manage ritual scripts** with multiple segments (opening, transition, core, closing, blessing)
- **Parameterize scripts** using template variables like `{{communityName}}`, `{{moonPhase}}`, etc.
- **Define variants** that adapt based on context (group size, location, moon phase, etc.)
- **Render scripts** by providing context values via API
- **Integrate with other services** like ritual-event-orchestrator and live-session-co-pilot

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Testing:** Jest
- **Containerization:** Docker & Docker Compose

## Domain Model

### RitualScript

Main script entity that represents a ritual ceremony.

```typescript
{
  id: string
  communityId: string
  key: string                    // Unique identifier (e.g., "new-moon-intention-setting")
  title: string                  // Display name
  ritualType: 'new_moon' | 'full_moon' | 'daily' | 'other'
  descriptionMarkdown: string
  createdAt: DateTime
  updatedAt: DateTime
  segments: RitualScriptSegment[]
  variants: RitualScriptVariant[]
}
```

### RitualScriptSegment

Individual sections of a ritual script, ordered by `orderIndex`.

```typescript
{
  id: string
  scriptId: string
  orderIndex: number             // 0, 1, 2, etc.
  segmentType: 'opening' | 'transition' | 'core' | 'closing' | 'blessing'
  templateMarkdown: string       // Contains {{variable}} placeholders
  variablesJson: object          // Schema of expected variables
  createdAt: DateTime
  updatedAt: DateTime
}
```

### RitualScriptVariant

Context-specific variants that adapt the script based on conditions.

```typescript
{
  id: string
  scriptId: string
  variantKey: string             // E.g., "online-large", "offline-small"
  conditionsJson: object         // E.g., { "location": "online", "groupSize": "large" }
  createdAt: DateTime
  updatedAt: DateTime
}
```

## Template Syntax

### Variable Substitution

Templates use `{{variableName}}` syntax for variable substitution.

**Example:**

```markdown
# Welcome to {{communityName}}

Hello {{facilitator}}, thank you for holding space for our {{groupSize}} circle.

Today we honor the {{moonPhase}} moon.
```

**Rendering Context:**

```json
{
  "communityName": "Sacred Circle",
  "facilitator": "Elena",
  "groupSize": "medium",
  "moonPhase": "new"
}
```

**Rendered Output:**

```markdown
# Welcome to Sacred Circle

Hello Elena, thank you for holding space for our medium circle.

Today we honor the new moon.
```

### Common Context Fields

- `communityName` - Name of the community
- `facilitator` - Name of the facilitator/leader
- `moonPhase` - `"new"`, `"waxing"`, `"full"`, `"waning"`
- `groupSize` - `"small"`, `"medium"`, `"large"`
- `location` - `"online"`, `"offline"`
- `date` - Date of the ritual
- `dayOfWeek` - Day of the week
- Custom fields as needed

### Variant Selection

Variants are selected based on **condition matching**. The most specific matching variant is chosen.

**Example Variants:**

```json
[
  {
    "variantKey": "default",
    "conditionsJson": {}
  },
  {
    "variantKey": "online",
    "conditionsJson": { "location": "online" }
  },
  {
    "variantKey": "online-large",
    "conditionsJson": { "location": "online", "groupSize": "large" }
  }
]
```

**Context:**

```json
{
  "location": "online",
  "groupSize": "large"
}
```

**Selected Variant:** `"online-large"` (most specific match)

## API Reference

### Scripts

#### List All Scripts

```http
GET /api/scripts
Query Parameters:
  - communityId (optional)
  - ritualType (optional)
```

#### Get Specific Script

```http
GET /api/scripts/{key}
```

#### Create Script

```http
POST /api/scripts
Body: {
  "communityId": "default",
  "key": "my-ritual",
  "title": "My Ritual",
  "ritualType": "new_moon",
  "descriptionMarkdown": "Optional description"
}
```

#### Update Script

```http
PUT /api/scripts/{key}
Body: {
  "title": "Updated Title",
  "ritualType": "full_moon",
  "descriptionMarkdown": "Updated description"
}
```

#### Delete Script

```http
DELETE /api/scripts/{key}
```

### Segments

#### Create Segment

```http
POST /api/scripts/{key}/segments
Body: {
  "orderIndex": 0,
  "segmentType": "opening",
  "templateMarkdown": "# Welcome to {{communityName}}",
  "variablesJson": { "communityName": "string" }
}
```

#### Update Segment

```http
PUT /api/scripts/{key}/segments/{id}
Body: {
  "orderIndex": 1,
  "templateMarkdown": "Updated content"
}
```

#### Delete Segment

```http
DELETE /api/scripts/{key}/segments/{id}
```

### Variants

#### Create Variant

```http
POST /api/scripts/{key}/variants
Body: {
  "variantKey": "online-large",
  "conditionsJson": {
    "location": "online",
    "groupSize": "large"
  }
}
```

### Rendering

#### Render Script

**The core API endpoint for rendering scripts with context.**

```http
POST /api/scripts/{key}/render
Body: {
  "contextJson": {
    "communityName": "Sacred Circle",
    "facilitator": "Elena",
    "moonPhase": "new",
    "groupSize": "medium",
    "location": "online"
  }
}

Response: {
  "scriptKey": "new-moon-intention-setting",
  "title": "New Moon Intention Setting Ceremony",
  "ritualType": "new_moon",
  "segments": [
    {
      "orderIndex": 0,
      "segmentType": "opening",
      "renderedMarkdown": "# Opening Circle\n\nWelcome, dear Sacred Circle family..."
    }
  ],
  "fullText": "# Opening Circle\n\nWelcome...\n\n---\n\n# Core...",
  "selectedVariant": "online-medium"
}
```

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Docker (optional, for containerized setup)

### Local Development

1. **Clone the repository:**

```bash
git clone <repository-url>
cd community-ritual-script-library
```

2. **Install dependencies:**

```bash
npm install
```

3. **Set up environment variables:**

```bash
cp .env.example .env
# Edit .env with your database connection string
```

4. **Start PostgreSQL (using Docker):**

```bash
docker-compose -f docker-compose.dev.yml up -d
```

5. **Run database migrations:**

```bash
npm run db:migrate
```

6. **Seed the database with example scripts:**

```bash
npm run db:seed
```

7. **Start the development server:**

```bash
npm run dev
```

8. **Open http://localhost:3000**

### Using Docker Compose (Full Stack)

```bash
# Build and start all services
docker-compose up --build

# The application will be available at http://localhost:3000
# Database migrations and seeding happen automatically
```

## Database Commands

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes to database (dev)
npm run db:push

# Create and run migrations
npm run db:migrate

# Seed the database
npm run db:seed

# Open Prisma Studio (database GUI)
npm run db:studio
```

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

## Project Structure

```
community-ritual-script-library/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed data
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── api/              # API routes
│   │   │   └── scripts/      # Script endpoints
│   │   ├── scripts/          # UI pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Home page
│   └── lib/
│       ├── prisma.ts         # Prisma client singleton
│       ├── template-renderer.ts  # Template rendering engine
│       ├── types.ts          # TypeScript types
│       └── __tests__/        # Tests
├── docker-compose.yml        # Production Docker setup
├── docker-compose.dev.yml    # Development Docker setup
├── Dockerfile                # Application container
├── next.config.js            # Next.js configuration
├── tsconfig.json             # TypeScript configuration
└── package.json              # Dependencies and scripts
```

## Example Ritual Scripts

The seed data includes three example scripts:

1. **New Moon Intention Setting** (`new-moon-intention-setting`)
   - 5 segments: opening, transition, core, blessing, closing
   - Variants for online/offline and small/large groups

2. **Full Moon Release** (`full-moon-release`)
   - 4 segments: opening, core, blessing, closing
   - Variants for online and offline gatherings

3. **Daily Morning Practice** (`daily-morning-practice`)
   - 4 segments: opening, gratitude, intention, closing
   - Simple daily ritual template

## Integration with Other Services

### Ritual Event Orchestrator

This library can be integrated with a ritual event orchestrator by:

1. Fetching scripts via the GET API
2. Rendering scripts with event-specific context via the POST `/render` API
3. Using the rendered output to guide the ceremony

**Example Integration:**

```typescript
// Fetch the script
const script = await fetch('/api/scripts/new-moon-intention-setting')

// Render with event context
const rendered = await fetch('/api/scripts/new-moon-intention-setting/render', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contextJson: {
      communityName: event.communityName,
      facilitator: event.facilitator,
      moonPhase: 'new',
      groupSize: event.participants.length > 20 ? 'large' : 'small',
      location: event.isOnline ? 'online' : 'offline'
    }
  })
})

// Use rendered.fullText or rendered.segments in your application
```

### Live Session Co-Pilot

The co-pilot can use this library to:

1. Suggest appropriate scripts based on session type
2. Render scripts with real-time context
3. Adapt scripts during the session based on participant count or other factors

## Development Guidelines

### Adding a New Script

1. Create via UI at `/scripts/new`
2. Add segments with template markdown
3. Define variants if needed
4. Test rendering at `/scripts/{key}/preview`

### Template Best Practices

- Use clear, descriptive variable names
- Document expected variables in `variablesJson`
- Provide default variants for common scenarios
- Test with different context values

### Variant Strategy

- **Default variant:** Empty conditions `{}`
- **Single condition:** `{ "location": "online" }`
- **Multiple conditions:** `{ "location": "online", "groupSize": "large" }`
- More specific variants take precedence

## License

MIT License - see LICENSE file for details

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Submit a pull request

## Support

For issues, questions, or contributions, please contact:

- Email: hilia10@ezweb.ne.jp
- GitHub: goodmonk06
