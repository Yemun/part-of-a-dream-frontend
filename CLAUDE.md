# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js frontend application for a Korean blog called "꿈의 일환" (Part of a Dream). It connects to a Strapi Cloud backend and features Korean localization, mobile-responsive design, and markdown content rendering.

## Development Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build

# Start production server
npm run start

# Run ESLint checks
npm run lint
```

## Environment Configuration

Required environment variables in `.env.local`:

```
NEXT_PUBLIC_STRAPI_URL=https://appealing-badge-1cb5ca360d.strapiapp.com
```

## Architecture & Data Flow

The application fetches blog content from Strapi Cloud via REST API:

1. **Strapi Cloud Backend**: Content management and API endpoints
2. **Next.js Frontend**: Static generation with server-side rendering
3. **Deployment**: Vercel hosting with automatic deployments

### Key API Integration

- **Blog Posts**: `GET /api/blogs?populate=*` - Fetches all published posts
- **Individual Post**: `GET /api/blogs?filters[Slug]=${slug}&populate=*` - Fetches post by slug
- **Content Type**: Blog posts have `Title` (string), `Content` (markdown), and `Slug` (UID)

## TypeScript Interfaces

Updated BlogPost interface for current Strapi schema:

```typescript
interface BlogPost {
  id: number;
  documentId: string;
  Slug: string;      // UID field for URL routing
  Title: string;     // Post title
  Content: string;   // Markdown content
  publishedAt: string;
}
```

## Design System

- **Typography**: Pretendard Variable font for Korean text optimization
- **Styling**: Tailwind CSS with mobile-first responsive design
- **Components**: React functional components with TypeScript
- **Content Rendering**: react-markdown for markdown content with custom styling

## Routing Strategy

- **Dynamic Routes**: `/posts/[id]` where `id` is the Slug field
- **Slug-based URLs**: Uses Strapi UID field for SEO-friendly URLs
- **API Filtering**: Queries Strapi by slug using `filters[Slug]=${slug}`

## Localization Features

- **Date Formatting**: Korean format (M월 D일) using custom `formatKoreanDate` function
- **Content**: Korean language interface and content
- **Font Optimization**: Pretendard for optimal Korean character rendering

## Mobile Responsiveness

Implements mobile-first design with Tailwind breakpoints:
- Base styles for mobile (< 640px)
- `sm:` prefix for desktop (≥ 640px)
- Responsive typography, spacing, and layout adjustments

## Next.js 15 Compatibility

This project uses Next.js 15 which has breaking changes:
- **Dynamic Route Params**: `params` in page components is now a Promise and must be awaited
- **Example**: `const { id } = await params;` instead of `params.id`

## Deployment

**Automated via GitHub Actions**: 
- Pushes to main branch trigger automatic Vercel deployment
- Workflow includes linting and build verification
- Requires GitHub Secrets: `VERCEL_TOKEN`, `ORG_ID`, `PROJECT_ID`

**Manual Vercel Deployment**:
- Import GitHub repository at https://vercel.com/new
- Set environment variable: `NEXT_PUBLIC_STRAPI_URL`

## Common Issues

1. **Build Errors on Vercel**: Ensure all dependencies are in package.json and committed to GitHub
2. **API Connection**: Verify NEXT_PUBLIC_STRAPI_URL environment variable is set correctly
3. **Content Not Displaying**: Check Strapi Cloud API permissions for public access to Blog content type
4. **Korean Font Issues**: Pretendard font is loaded via CDN in globals.css
5. **Next.js 15 Params**: Remember to await params in dynamic routes