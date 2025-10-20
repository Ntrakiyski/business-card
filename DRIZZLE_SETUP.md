# Drizzle ORM Setup Guide

This project uses Drizzle ORM for type-safe database operations with automatic migrations on Docker deployment.

## 🎯 What This Does

- **Type-Safe Database Queries**: No more `@ts-expect-error` hacks
- **Automatic Migrations**: Runs migrations automatically when Docker container starts
- **Better Developer Experience**: Autocomplete, type checking, and refactoring support
- **Schema Management**: Changes to schema are tracked and versioned

## 📦 Environment Variables Required

Add this to your Coolify environment variables:

```bash
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@[YOUR_HOST]:[PORT]/postgres
```

You can find this in your Supabase dashboard:
**Project Settings → Database → Connection String → URI**

## 🚀 How It Works

### 1. Development Workflow

When you need to make schema changes:

```bash
# 1. Edit the schema in lib/db/schema.ts
# 2. Generate a new migration
npm run db:generate

# 3. Apply migrations locally (optional)
npm run db:migrate

# 4. View database in Drizzle Studio (optional)
npm run db:studio
```

### 2. Production Deployment

Migrations run **automatically** when your Docker container starts!

The Dockerfile includes a startup script that:
1. Runs all pending migrations
2. If migrations succeed → starts the Next.js server
3. If migrations fail → container exits with error

**No manual migration steps needed!** Just push your code and deploy.

## 📁 File Structure

```
├── lib/
│   └── db/
│       ├── schema.ts      # Database schema definition
│       └── index.ts       # Database client setup
├── drizzle/
│   └── migrations/        # Auto-generated migration files
├── scripts/
│   └── migrate.ts         # Migration runner script
└── drizzle.config.ts      # Drizzle configuration
```

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm run db:generate` | Generate new migration from schema changes |
| `npm run db:migrate` | Run pending migrations locally |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:push` | Push schema changes directly (dev only) |

## 🔄 Making Schema Changes

### Example: Adding a New Field

1. **Edit `lib/db/schema.ts`:**
```typescript
export const profiles = pgTable('profiles', {
  // ... existing fields
  newField: text('new_field'),  // Add this
});
```

2. **Generate Migration:**
```bash
npm run db:generate
```

3. **Commit and Push:**
```bash
git add .
git commit -m "Add new_field to profiles"
git push
```

4. **Deploy:**
- Coolify picks up changes
- Docker builds with new migration
- Migration runs automatically on startup ✨

## 🔍 Querying the Database

Use Drizzle instead of Supabase for database queries:

### Before (Supabase):
```typescript
const { data } = await supabase
  .from('profiles')
  .select('*')
  .eq('username', username);
```

### After (Drizzle):
```typescript
import { db } from '@/lib/db';
import { profiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const data = await db
  .select()
  .from(profiles)
  .where(eq(profiles.username, username));
```

**Benefits:**
- Full TypeScript autocomplete
- Type-safe queries
- No more type errors!

## ⚠️ Important Notes

1. **Supabase Auth Still Works**: We only replaced database queries, not authentication
2. **RLS Policies Remain**: Row-level security is still enforced in the database
3. **Backwards Compatible**: Existing Supabase migrations are not affected
4. **Migration History**: Drizzle tracks which migrations have run

## 🐛 Troubleshooting

### Container won't start
- Check Coolify logs for migration errors
- Verify `DATABASE_URL` is set correctly
- Ensure database is accessible from container

### Schema changes not applying
- Run `npm run db:generate` locally
- Commit the new migration file in `drizzle/migrations/`
- Push and redeploy

### Local development issues
- Make sure `.env.local` has `DATABASE_URL`
- Run `npm run db:migrate` to apply pending migrations

## 📚 Learn More

- [Drizzle ORM Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle with Next.js](https://orm.drizzle.team/docs/get-started-postgresql#nextjs)
- [PostgreSQL Best Practices](https://orm.drizzle.team/docs/goodies)

---

**Questions?** Check the Drizzle docs or open an issue!

