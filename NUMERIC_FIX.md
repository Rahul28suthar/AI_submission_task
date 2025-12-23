# PostgreSQL Numeric Type Conversion Fix

## Problem
PostgreSQL DECIMAL/NUMERIC columns are returned as strings by the `@vercel/postgres` driver, not as JavaScript numbers. This caused runtime errors when trying to call `.toFixed()` on string values.

## Solution
Added explicit type conversions in all API routes that fetch numeric data from the database.

## Files Fixed

### 1. API Routes (Server-side conversions)
- **app/api/db/sessions/[id]/route.ts** - Converts `total_cost` and `total_tokens` in GET handler
- **app/api/db/sessions/route.ts** - Converts numeric fields in sessions list

### 2. Client Components (Defensive conversions)
- **components/research-viewer.tsx** - Uses `Number()` with fallback to 0 for safe display
- **components/research-history.tsx** - Maps sessions and converts numeric fields client-side

### 3. Server Components
- **app/page.tsx** - Already had proper conversions using `Number()`

## Pattern Used

```typescript
// API Route (primary conversion)
const session = {
  ...row,
  total_cost: Number.parseFloat(row.total_cost || "0"),
  total_tokens: Number.parseInt(row.total_tokens || "0", 10),
}

// Client Component (defensive conversion)
const totalCost = Number(session?.total_cost) || 0
const totalTokens = Number(session?.total_tokens) || 0
```

## Testing
After this fix, all numeric displays should work correctly:
- Cost tracking dashboard
- Research session details
- History list
- Cost calculations

## Future Considerations
Consider using an ORM like Prisma that handles type conversions automatically, or implement a data access layer that standardizes numeric conversions.
