# Deployment Guide

This guide covers deploying the Digital Business Card application to Coolify or any Docker-based hosting platform.

## Prerequisites

- Docker and Docker Compose installed
- Supabase project set up with:
  - Database tables created (use `supabase/migrations/*.sql`)
  - Environment variables configured
- Domain name (optional, but recommended)

## Environment Variables

Create a `.env` file or set these in your hosting platform:

```bash
# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App URL (Optional - auto-configured in Coolify)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Coolify Deployment

### Step 1: Prepare Your Repository

Ensure these files are in your repository root:
- ✅ `Dockerfile`
- ✅ `docker-compose.yml`
- ✅ `next.config.ts` (with `output: 'standalone'`)

### Step 2: Create New Resource in Coolify

1. Log into your Coolify dashboard
2. Click "New Resource"
3. Select "Docker Compose"
4. Connect your Git repository

### Step 3: Configure Environment Variables

In Coolify, add the following environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Note: `COOLIFY_URL` and `COOLIFY_FQDN` are automatically provided by Coolify.

### Step 4: Deploy

1. Click "Deploy" in Coolify
2. Wait for the build to complete (first build takes 3-5 minutes)
3. Your app will be available at the assigned URL

### Step 5: Configure Custom Domain (Optional)

1. In Coolify, go to your app settings
2. Add your custom domain
3. Coolify will automatically configure SSL with Let's Encrypt

## Docker Compose Deployment (Self-Hosted)

### Build and Run

```bash
# Build the image
docker-compose build

# Start the service
docker-compose up -d

# View logs
docker-compose logs -f
```

### Environment Configuration

Create a `.env` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_APP_URL=https://your-domain.com
COOLIFY_URL=https://your-domain.com
COOLIFY_FQDN=your-domain.com
```

### Nginx Reverse Proxy

If you're using Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Vercel Deployment (Alternative)

If you prefer Vercel:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Set production domain
```

Note: Remove `output: 'standalone'` from `next.config.ts` for Vercel deployment.

## Supabase Setup

### 1. Create Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Save your project URL and anon key

### 2. Run Migrations

```bash
# Using Supabase CLI
supabase db push

# Or manually run the SQL files in supabase/migrations/
```

### 3. Enable Row Level Security

All tables should have RLS enabled. Check the migration files for the policies.

## Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies enabled
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active
- [ ] Test user signup and login
- [ ] Test profile creation
- [ ] Test QR code generation
- [ ] Mobile responsiveness verified

## Monitoring

### Health Check

```bash
curl https://your-domain.com/
```

### Docker Logs

```bash
docker-compose logs -f nextjs-app
```

### Database Logs

Check Supabase dashboard for database logs and errors.

## Troubleshooting

### Build Fails

- Check that `next.config.ts` has `output: 'standalone'`
- Verify all dependencies are in `package.json`
- Check Docker logs for specific errors

### App Won't Start

- Verify environment variables are set correctly
- Check that Supabase project is active
- Verify database migrations were applied

### 500 Errors

- Check Supabase connection
- Verify RLS policies are correct
- Check browser console for client-side errors

## Scaling

For production use:

1. **Database**: Upgrade Supabase plan for better performance
2. **CDN**: Use a CDN for static assets
3. **Monitoring**: Set up application monitoring (Sentry, LogRocket)
4. **Backups**: Configure automated database backups in Supabase

## Security Recommendations

- [ ] Use strong passwords for Supabase project
- [ ] Enable 2FA on Supabase account
- [ ] Regularly update dependencies
- [ ] Monitor for security vulnerabilities
- [ ] Use HTTPS only (enforced by Coolify/Vercel)
- [ ] Keep anon key secure (it's safe to expose client-side)
- [ ] Never expose service_role key

## Support

For issues:
1. Check Docker/Coolify logs
2. Verify Supabase project status
3. Review environment variables
4. Check GitHub issues for known problems

