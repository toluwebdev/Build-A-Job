# Build-A-Job Admin Dashboard

A comprehensive Next.js 14 admin dashboard for the Build-A-Job platform - an AI-powered two-sided trade marketplace.

## Features

### 9 Admin Pages

1. **Overview** - Platform KPIs, health alerts, real-time event ticker, charts
2. **Users** - Customer management with TanStack Table (sorting, filtering, pagination)
3. **Trades** - Trade partner management with verification queue
4. **Jobs** - Job lifecycle management with status tracking
5. **Disputes** - Dispute resolution with SLA indicators
6. **Moderation** - Content moderation for reviews and photos
7. **Finance** - Transaction ledger, revenue reports, discount codes
8. **Config** - Platform settings, categories, subscription tiers, feature flags
9. **Reports** - Analytics (acquisition, funnel, retention, NPS, lead quality) with scheduled reports

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **UI Components**: Radix UI primitives + custom components
- **Tables**: TanStack Table v8
- **Charts**: Recharts
- **Real-time**: Socket.io client (ready for integration)
- **Icons**: Lucide React

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

### Build

```bash
npm run build
```

### Type Check

```bash
npm run type-check
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── overview/          # Dashboard overview page
│   ├── users/             # User management
│   ├── trades/            # Trade partner management
│   ├── jobs/              # Job management
│   ├── disputes/          # Dispute resolution
│   ├── moderation/        # Content moderation
│   ├── finance/           # Financial management
│   ├── config/            # Platform configuration
│   ├── reports/           # Analytics & reports
│   ├── dashboard-layout.tsx # Shared dashboard layout
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/
│   ├── ui/                # Reusable UI components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── tabs.tsx
│   │   ├── switch.tsx
│   │   ├── breadcrumb.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   └── layout/            # Layout components
│       ├── sidebar.tsx    # Collapsible navigation
│       └── header.tsx     # Top header with notifications
├── lib/
│   └── utils.ts           # Utility functions (cn, formatters)
```

## Key Features

### Dark Theme
- Default dark mode with violet/teal accent colors
- Custom CSS variables for consistent theming
- Recharts dark theme overrides

### TanStack Table Integration
All data tables include:
- Global search filtering
- Column sorting
- Pagination
- Row selection
- Bulk actions

### Recharts Visualizations
- Area charts for revenue trends
- Bar charts for funnels and categories
- Line charts for trends
- Pie charts for distributions
- Responsive containers

### Real-time Ready
- Socket.io client configured
- Event ticker component
- Ready for live notifications

### Responsive Design
- Collapsible sidebar (64px/240px states)
- Responsive grid layouts
- Mobile-friendly tables

## Environment Variables

Create a `.env.local` file:

```env
# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Authentication
NEXT_PUBLIC_AUTH_DOMAIN=your-auth-domain
```

## Customization

### Adding New Navigation Items

Edit `src/components/layout/sidebar.tsx`:

```typescript
const navItems: NavItem[] = [
  // ... existing items
  { label: "New Page", href: "/new-page", icon: YourIcon },
];
```

### Adding New Chart Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  // ... existing colors
  yourColor: {
    500: "#your-color",
  },
}
```

### Status Badge Styles

Edit `src/app/globals.css`:

```css
.status-your-status { @apply bg-your-color/20 text-your-color; }
```

## API Integration

To connect to real APIs, replace mock data in each page:

```typescript
// Replace this:
const mockData = [...];

// With this:
const { data, isLoading } = useQuery({
  queryKey: ['your-key'],
  queryFn: fetchYourData,
});
```

## Socket.io Integration

To enable real-time features:

```typescript
import { io } from "socket.io-client";

const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL);

socket.on("event-name", (data) => {
  // Handle real-time update
});
```

## License

Private - Build-A-Job Platform
