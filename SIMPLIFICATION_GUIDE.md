# Business Card App Simplification Guide

This guide documents the major architectural simplification made to the business card application.

## What Changed

### 1. **Single Page Edit/Preview System**
   - **Removed**: Multi-step card creation (`/create-card/step-1`, `/create-card/step-2`)
   - **Removed**: Separate edit page (`/[username]/edit`)
   - **Added**: Single unified page at `/[username]` with toggle for Edit/Preview modes
   - **Default**: Edit mode is ON when viewing your own card, OFF when viewing others

### 2. **Persistent Sidebar Navigation**
   - **Added**: Hover-activated sidebar on the left edge of the screen
   - **How it works**: Move mouse to the leftmost 20px of screen to reveal sidebar
   - **Features**: 
     - Close button on top right
     - Navigation links (Home, My Card, Profile Settings, Logout)
     - Available on all pages for authenticated users
     - Works even when viewing other users' cards

### 3. **Onboarding Improvements**
   - **Added**: `onboarding_completed` flag to profiles table
   - **Behavior**: Onboarding only shows once during first registration
   - **Fixed**: Users won't see onboarding again after completing it

### 4. **Widget Toggle System**
   - **Already existed**: Enable/disable toggle on each widget
   - **Location**: Top right of each widget container
   - **Icons**: Eye icon + Switch control next to Edit button
   - **Behavior**: Disabled widgets hidden in preview mode

### 5. **Database Cleanup**
   - **Added**: Script to clean all database records
   - **Usage**: `npm run db:clean` or `bun run db:clean`
   - **Purpose**: Fresh start to fix any registration issues

## File Structure Changes

### New Files
```
components/layout/sidebar.tsx              # Hover-activated sidebar
components/layout/edit-preview-toggle.tsx  # Edit/Preview mode toggle
components/profile/card-page-client.tsx    # Client-side card page logic
scripts/clean-database.ts                  # Database cleanup script
drizzle/migrations/0001_add_onboarding_completed.sql
SIMPLIFICATION_GUIDE.md                    # This file
```

### Modified Files
```
lib/db/schema.ts                          # Added onboarding_completed field
middleware.ts                             # Updated to use onboarding_completed
app/[username]/page.tsx                   # Simplified to server component
app/actions/profile.ts                    # Sets onboarding_completed flag
app/home/page.tsx                         # Removed "Create Card" button
components/home/my-cards-section.tsx      # Updated empty state
package.json                              # Added db:clean script
```

### Deleted Files (to be removed)
```
app/create-card/step-1/page.tsx           # No longer needed
app/create-card/step-2/page.tsx           # No longer needed
app/[username]/edit/page.tsx              # Merged into main page
```

## Database Schema Changes

### Added Column
```sql
ALTER TABLE "profiles" 
ADD COLUMN "onboarding_completed" boolean DEFAULT false;
```

### Migration
Run: `npm run db:migrate` or `bun run db:migrate` to apply the new migration

## Usage Guide

### For Users

1. **First Time Registration**
   - Sign up → Set username in onboarding → Redirected to home
   - Your card is automatically created

2. **Viewing Your Card**
   - Click "My Card" from sidebar or home dashboard
   - Default: **Edit Mode** (all widgets editable, toggle controls visible)
   - Toggle to **Preview Mode** to see how others see your card

3. **Editing Your Card**
   - In Edit Mode: Click edit icon on any widget to make changes
   - Enable/disable widgets using the eye icon + switch
   - Changes save automatically

4. **Viewing Others' Cards**
   - Navigate to `/{username}`
   - No edit/preview toggle shown
   - Only enabled widgets visible
   - Sidebar still accessible via left edge hover

### For Developers

#### Database Cleanup
```bash
# Clean all records (USE WITH CAUTION!)
npm run db:clean
```

#### Running Migrations
```bash
# Generate new migration
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes directly (alternative)
npm run db:push
```

#### Development Workflow
```bash
# Start dev server
npm run dev

# Open database studio
npm run db:studio
```

## Technical Details

### Sidebar Implementation
- Uses `mousemove` event listener
- Triggers when `clientX <= 20px`
- Auto-hides when mouse moves beyond 300px
- Z-index: 50 (sidebar), 40 (backdrop)

### Edit/Preview Toggle
- Client-side state management
- Passes `isEditMode` to all widget components
- Filters links/services based on enabled status
- Positioned fixed at top-right (z-index: 30)

### Widget Visibility Logic
```typescript
// Edit mode (owner): Show all widgets
// Preview mode (owner): Show only enabled widgets
// Viewing others: Show only enabled widgets
const showWidget = (isEditMode && isOwner) || widget.enabled;
```

### Onboarding Flow
```
User signs up
  ↓
Middleware checks onboarding_completed
  ↓
If false → /onboarding
  ↓
Set username + onboarding_completed = true
  ↓
Redirect to /home
  ↓
Never see onboarding again
```

## Migration Path

### From Old System
1. Run database cleanup (optional): `npm run db:clean`
2. Apply new migration: `npm run db:migrate`
3. Existing users will have `onboarding_completed` set to true automatically
4. Deploy new code
5. Old routes (`/create-card/*`, `/[username]/edit`) can be safely deleted

### Rollback Plan
If needed to rollback:
1. Revert code changes
2. Run: `ALTER TABLE profiles DROP COLUMN onboarding_completed;`
3. Re-deploy previous version

## Benefits

✅ **Simpler UX**: One screen for everything, no navigation between steps
✅ **Faster**: No page transitions between edit/preview
✅ **Cleaner**: Removed 3 route files, consolidated logic
✅ **Better Navigation**: Sidebar always accessible
✅ **Fixed Onboarding**: Won't repeat for existing users
✅ **More Intuitive**: Toggle between modes in real-time

## Support

For issues or questions about this simplification, refer to:
- [README.md](./README.md) - Main project documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [DRIZZLE_SETUP.md](./DRIZZLE_SETUP.md) - Database setup

