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
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── widgets/             # Profile widgets
│   │   ├── profile-widget.tsx
│   │   ├── bio-widget.tsx
│   │   ├── links-widget.tsx
│   │   ├── social-widget.tsx
│   │   ├── services-widget.tsx
│   │   ├── contact-widget.tsx
│   └── edit/                # Edit mode components
├── lib/
│   ├── supabase/            # Supabase client utilities
│   │   ├── client.ts        # Browser client
│   │   └── server.ts        # Server client
│   ├── database.types.ts    # Generated TypeScript types
│   ├── vcard-generator.ts   # vCard file generation
│   └── utils.ts
├── supabase/
│   └── migrations/          # Database migrations
└── public/
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
   - Run the migration file in your Supabase SQL Editor
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
    ],
  },
};
```

## Features Implementation

### Widget System
Each profile consists of 7 modular widgets:
1. Profile Widget - Photo, name, title, company, location, Save Contact button
2. Bio Widget - Personal/professional summary
3. Links Widget - Horizontal scrollable custom links with images
4. Social Widget - Social media icons and links
5. Services Widget - List of services/skills offered
6. Contact Widget - Phone, email, website, address with tap-to-call/email
7. Map Widget - Interactive Leaflet map with location pin

### Inline Editing
- Owners see edit icons on each widget when viewing their own profile
- Clicking edit opens a bottom drawer with widget-specific form
- Changes are saved via Server Actions with instant feedback
- Image uploads handled immediately to Supabase Storage

### Authentication and Authorization
- Uses Supabase Auth for user authentication
- Middleware protects routes like `/my-card`, `/login`, `/signup`, and `/onboarding`
- Implements proper redirects based on user authentication status and onboarding completion

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
- Environment variables properly configured for security

### Testing
- Playwright for end-to-end testing
- Includes mobile screenshot tests
- Headed and UI test modes available

## Deployment

### Coolify Deployment
1. Ensure Dockerfile, docker-compose.yml, and next.config.ts are properly configured
2. Set environment variables (Supabase URL and anon key)
3. Deploy using Coolify's Docker Compose integration

### Vercel Deployment
1. Deploy using Vercel's GitHub integration
2. Add environment variables in Vercel dashboard
3. Note: Remove `output: 'standalone'` from next.config.ts for Vercel deployment

### Self-Hosted Docker
```bash
# Build the image
docker-compose build

# Start the service
docker-compose up -d
```

## Database Schema
The application uses 5 main tables:
- `profiles` - User profile information
- `custom_links` - Custom link widgets
- `social_links` - Social media links
- `services` - Services/skills offered
- `widget_settings` - Widget visibility and ordering

All tables have Row-Level Security (RLS) policies enforced for security.

## Key Dependencies

### Core Dependencies
- `@supabase/supabase-js` - Supabase client
- `next` - Next.js framework
- `react` & `react-dom` - React library
- `zod` - Schema validation
- `zustand` - State management
- `leaflet` & `react-leaflet` - Interactive maps
- `qrcode` & `qrcode.react` - QR code generation

### UI Dependencies
- `@radix-ui/react-*` - Accessible UI components
- `lucide-react` - Icon library
- `tailwind-merge` & `clsx` - Class name management
- `sonner` - Toast notifications
- `@hookform/resolvers` & `react-hook-form` - Form handling

### Dev Dependencies
- `@types/*` - TypeScript type definitions
- `@playwright/test` - End-to-end testing
- `@tailwindcss/postcss` - PostCSS plugin for Tailwind
- `eslint` & `typescript` - Code quality tools

## Environment Variables

The application requires the following environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for server-side operations)
- `NEXT_PUBLIC_APP_URL` - Public URL of your application (for local development)

## Security Considerations

- Authentication and authorization implemented with Supabase Auth
- Row-Level Security (RLS) policies on all database tables
- Server Actions for secure data mutations
- Proper environment variable handling for sensitive data
- Middleware protection for authenticated routes