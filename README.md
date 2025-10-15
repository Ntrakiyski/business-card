# Digital Business Card Application

A modern, mobile-first web application for creating and sharing dynamic digital business cards with QR codes.

## Features

- 📱 **Mobile-First Design** - Optimized for mobile viewing and sharing
- 🎨 **Widget-Based Profile** - Modular components (Profile, Bio, Links, Social, Services, Contact, Map)
- ✏️ **Inline Editing** - Edit widgets directly with bottom drawer interface
- 📇 **Save Contact** - Generate .vcf files for easy contact saving on iOS/Android
- 🔗 **QR Code Sharing** - Each user gets a unique QR code linking to their profile
- 🗺️ **Interactive Maps** - Location display with Leaflet/OpenStreetMap
- 🔐 **Secure Authentication** - Powered by Supabase Auth
- 🎯 **Username-Based URLs** - Professional URLs like `yourapp.com/johnsmith`

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Runtime**: Node.js (Bun-compatible)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS v4
- **Validation**: Zod
- **State Management**: Zustand (minimal global state)

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- A Supabase account and project

### 1. Clone the repository

\`\`\`bash
git clone https://github.com/yourusername/business-card.git
cd business-card
\`\`\`

### 2. Install dependencies

\`\`\`bash
npm install
# or
bun install
\`\`\`

### 3. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the migration file in your Supabase SQL Editor:
   - Go to SQL Editor in your Supabase dashboard
   - Copy and paste the content from `supabase/migrations/001_initial_schema.sql`
   - Run the query

3. Set up Storage:
   - Go to Storage in your Supabase dashboard
   - Create a new bucket called `profile-images`
   - Set it to **public** for profile pictures
   - Create another bucket called `link-images` (also public)

### 4. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:

\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local`:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 5. Run the development server

\`\`\`bash
npm run dev
# or
bun dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

\`\`\`
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
│   │   └── map-widget.tsx
│   └── edit/                # Edit mode components
│       ├── widget-edit-drawer.tsx
│       └── forms/
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
\`\`\`

## Key Features Implementation

### Widget System

Each profile consists of 7 modular widgets:

1. **Profile Widget** - Photo, name, title, company, location, Save Contact button
2. **Bio Widget** - Personal/professional summary
3. **Links Widget** - Horizontal scrollable custom links with images
4. **Social Widget** - Social media icons and links
5. **Services Widget** - List of services/skills offered
6. **Contact Widget** - Phone, email, website, address with tap-to-call/email
7. **Map Widget** - Interactive Leaflet map with location pin

### Inline Editing

- Owners see edit icons on each widget when viewing their own profile
- Clicking edit opens a bottom drawer with widget-specific form
- Changes are saved via Server Actions with instant feedback
- Image uploads handled immediately to Supabase Storage

### QR Code Generation

- Each user has a unique profile URL: `yourapp.com/username`
- QR code encodes this URL for easy scanning
- Owner can view their QR code at `/my-card` route
- QR code can be downloaded as an image

### Contact Saving

- "Save Contact" button generates a .vcf (vCard) file
- Works natively on iOS and Android mobile browsers
- Downloads automatically and prompts to add to contacts

## Database Schema

The application uses 5 main tables:

- **profiles** - User profile information
- **custom_links** - Custom link widgets
- **social_links** - Social media links
- **services** - Services/skills offered
- **widget_settings** - Widget visibility and ordering

All tables have Row-Level Security (RLS) policies enforced.

## Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/business-card)

1. Push your code to GitHub
2. Import your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Deploy with Docker (Coolify)

The project includes `next.config.ts` with `output: 'standalone'` for Docker deployments.

See deployment documentation in `docs/deployment.md` for detailed instructions.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.

