# Digital Business Card Application - QWEN Guide

## Project Overview

This is a modern, mobile-first web application for creating and sharing dynamic digital business cards with QR codes. The application allows users to create customizable profile pages with various widgets, including profile information, bio, links, social media, services, contact information, and interactive maps.

### Key Technologies
- **Framework**: Next.js 15+ (App Router with Turbopack)
- **Runtime**: Node.js (Bun-compatible)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **State Management**: Zustand
- **Maps**: Leaflet/OpenStreetMap
- **QR Codes**: qrcode library

### Project Architecture
- Next.js App Router with page-based routing
- Component-based architecture with modular widgets
- Server Actions for data mutations
- Supabase for backend services (auth, database, storage)
- Responsive design optimized for mobile devices

## Project Structure

```
business-card/
├── app/                      # Next.js App Router pages
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── onboarding/
│   ├── (dashboard)/         # Authenticated routes
│   │   └── my-card/         # Owner's QR code view
│   ├── [username]/          # Public profile pages
│   ├── actions/             # Server Actions
│   ├── api/                 # API routes (if any)
│   ├── layout.tsx
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── edit/                # Edit mode components
│   │   ├── forms/           # Widget-specific forms
│   │   └── widget-edit-drawer.tsx
│   ├── ui/                  # shadcn/ui components
│   ├── widgets/             # Profile widgets
│   │   ├── bio-widget.tsx
│   │   ├── contact-widget.tsx
│   │   ├── links-widget.tsx
│   │   ├── map-widget.tsx
│   │   ├── profile-widget.tsx
│   │   ├── services-widget.tsx
│   │   └── social-widget.tsx
│   ├── logout-button.tsx
│   ├── profile-view-container.tsx
│   └── service-preview-drawer.tsx
├── lib/
│   ├── supabase/            # Supabase client utilities
│   │   ├── client.ts        # Browser client
│   │   └── server.ts        # Server client
│   ├── types/               # TypeScript type definitions
│   │   └── database.ts      # Generated Supabase types
│   ├── validations/         # Zod validation schemas
│   ├── database.types.ts    # Generated TypeScript types (legacy)
│   ├── utils.ts
│   └── vcard-generator.ts   # vCard file generation
├── supabase/
│   └── migrations/          # Database migrations
├── public/
├── scripts/
├── tests/                   # Test files
├── globals.css
├── middleware.ts            # Authentication middleware
├── next.config.ts
├── package.json
└── README.md
```

## Building and Running

### Prerequisites
- Node.js 18+ or Bun
- A Supabase account and project

### Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   # or
   bun install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the migration file in your Supabase SQL Editor (001_initial_schema.sql)
   - Set up Storage buckets (`profile-images` and `link-images`) as public

3. **Configure environment variables:**
   Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   ```bash
   cp .env.local.example .env.local
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   bun dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the application.

### Available Scripts

- `dev` - Start the development server with Turbopack
- `build` - Build the application for production with Turbopack
- `start` - Start the production server
- `lint` - Run ESLint
- `test` - Run Playwright tests
- `test:headed` - Run Playwright tests in headed mode
- `test:ui` - Run Playwright tests with UI mode
- `test:screenshots` - Run Playwright tests for mobile screenshots

### Production Build

The project is configured for standalone output, making it suitable for Docker deployment:

```javascript
// next.config.ts
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'media.licdn.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '**.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'codegen.com',
      },
    ],
  },
};
```

## Features Implementation

### Widget System
Each profile consists of 7 modular widgets:
1. **Profile Widget** - Photo, display name, job title, company, location, Save Contact button
2. **Bio Widget** - Personal/professional summary
3. **Links Widget** - Horizontal scrollable custom links with images
4. **Social Widget** - Social media icons and links (including phone numbers that start with + to initiate calls)
5. **Services Widget** - List of services/skills offered
6. **Contact Widget** - Phone, email, website, and address with tap-to-call/email
7. **Map Widget** - Interactive Leaflet map with location pin

### Inline Editing
- Owners see edit icons on each widget when viewing their own profile
- Clicking edit opens a bottom drawer with widget-specific form
- Changes are saved via Server Actions with instant feedback
- Image uploads handled immediately to Supabase Storage

### Authentication and Authorization
- Uses Supabase Auth for user authentication
- Middleware protects routes like `/my-card`, `/login`, `/signup`, and `/onboarding`
- Implements proper redirects based on user authentication status and onboarding completion
- Middleware includes checks for profile completion before accessing `/my-card`

### QR Code Generation
- Each user has a unique profile URL: `yourapp.com/username`
- QR code encodes this URL for easy scanning
- Owner can view their QR code at `/my-card` route
- QR code can be downloaded as an image

### Contact Saving
- "Save Contact" button generates a .vcf (vCard) file
- Works natively on iOS and Android mobile browsers
- Downloads automatically and prompts to add to contacts

## Development Conventions

### Code Style
- TypeScript is used throughout the project
- ESLint with Next.js recommended rules
- Tailwind CSS for styling with class-variance-authority for component variants
- Component-based architecture following React best practices
- Zod for schema validation

### File Organization
- Next.js App Router structure for routing
- Components organized by functionality (ui, widgets, edit)
- Server Actions in `app/actions/` directory
- Supabase utilities in `lib/supabase/`
- Database types in `lib/types/database.ts`
- Validation schemas in `lib/validations/`
- Environment variables properly configured for security

### Testing
- Playwright for end-to-end testing
- Includes mobile screenshot tests
- Headed and UI test modes available

## Database Schema
The application uses 6 main tables with Row-Level Security (RLS) policies:

1. **`profiles`** - User profile information (extends auth.users)
   - id (UUID, primary key, references auth.users)
   - username (TEXT, unique, not null)
   - display_name (TEXT)
   - job_title (TEXT)
   - company (TEXT)
   - location (TEXT)
   - bio (TEXT)
   - profile_image_url (TEXT)
   - email (TEXT)
   - phone (TEXT)
   - website (TEXT)
   - address (TEXT)
   - latitude (DECIMAL)
   - longitude (DECIMAL)
   - created_at (TIMESTAMPTZ)
   - updated_at (TIMESTAMPTZ)

2. **`custom_links`** - Custom link widgets
   - id (UUID, primary key)
   - profile_id (UUID, references profiles, cascade delete)
   - title (TEXT, not null)
   - url (TEXT, not null)
   - image_url (TEXT)
   - order (INTEGER, default 0)
   - enabled (BOOLEAN, default true)
   - created_at (TIMESTAMPTZ)

3. **`social_links`** - Social media links
   - id (UUID, primary key)
   - profile_id (UUID, references profiles, cascade delete)
   - platform (TEXT, not null) - facebook, instagram, twitter, linkedin, youtube, spotify, etc.
   - url (TEXT, not null)
   - enabled (BOOLEAN, default true)
   - created_at (TIMESTAMPTZ)

4. **`services`** - Services/skills offered
   - id (UUID, primary key)
   - profile_id (UUID, references profiles, cascade delete)
   - title (TEXT, not null)
   - description (TEXT)
   - icon (TEXT) - icon name or URL
   - order (INTEGER, default 0)
   - enabled (BOOLEAN, default true)
   - created_at (TIMESTAMPTZ)

5. **`widget_settings`** - Widget visibility and ordering
   - id (UUID, primary key)
   - profile_id (UUID, references profiles, cascade delete)
   - widget_type (TEXT, not null) - profile, bio, links, social, services, contact, map
   - enabled (BOOLEAN, default true)
   - order (INTEGER, default 0)
   - created_at (TIMESTAMPTZ)
   - UNIQUE constraint on (profile_id, widget_type)

6. **`business_cards`** (from older schema) - Legacy table for business card data
   - id (UUID, primary key)
   - user_id (UUID, references auth.users, cascade delete)
   - profile_id (UUID, references profiles, cascade delete)
   - name (TEXT, not null)
   - title (TEXT)
   - company (TEXT)
   - email (TEXT)
   - phone (TEXT)
   - website (TEXT)
   - address (TEXT)
   - bio (TEXT)
   - avatar_url (TEXT)
   - created_at (TIMESTAMPTZ)
   - updated_at (TIMESTAMPTZ)

All tables have Row-Level Security (RLS) policies enforced for security:
- **Profiles**: Public can view profiles, users can manage their own
- **Custom Links**: Public can view enabled links, users can manage their own
- **Social Links**: Public can view enabled links, users can manage their own
- **Services**: Public can view enabled services, users can manage their own
- **Widget Settings**: Public can view settings, users can manage their own

## Key Dependencies

### Core Dependencies
- `@supabase/supabase-js` - Supabase client
- `@supabase/ssr` - Supabase server-side rendering utilities
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `zod` - Schema validation
- `zustand` - State management
- `leaflet` & `react-leaflet` - Interactive maps
- `qrcode` & `qrcode.react` - QR code generation
- `lucide-react` - Icon library
- `framer-motion` - Animations

### UI Dependencies
- `@radix-ui/react-*` - Accessible UI components
- `@hookform/resolvers` & `react-hook-form` - Form handling
- `vaul` - Bottom sheet drawer components
- `sonner` - Toast notifications
- `class-variance-authority`, `clsx` & `tailwind-merge` - Class name management

### Dev Dependencies
- `@types/*` - TypeScript type definitions
- `@playwright/test` - End-to-end testing
- `@tailwindcss/postcss` - PostCSS plugin for Tailwind
- `eslint` & `typescript` - Code quality tools
- `tailwindcss` - Styling framework

## Environment Variables

The application requires the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)
- `NEXT_PUBLIC_APP_URL` - Public URL of your application (for local development)

## Security Considerations

- Authentication and authorization implemented with Supabase Auth
- Row-Level Security (RLS) policies on all database tables to control access
- Server Actions for secure data mutations
- Proper environment variable handling for sensitive data
- Middleware protection for authenticated routes
- Automatic timestamp update triggers to track changes
- Default widget settings initialization for new profiles