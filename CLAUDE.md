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

The application uses a hybrid server/client architecture for optimal performance:

1. **Strapi Cloud Backend**: Content management and API endpoints
2. **Next.js Server Components**: Initial data fetching and SSR
3. **Client Components**: Interactive features (comments, forms)
4. **Deployment**: Vercel hosting with automatic deployments

### Rendering Strategy

- **Server Components**: Posts, profile, and initial comment data are fetched server-side
- **Client Components**: Comment interactions, forms, and dynamic UI elements
- **Hybrid Approach**: Combines SSR performance with client-side interactivity

### Key API Integration

- **Blog Posts**: `GET /api/blogs?populate=*` - Fetches all published posts
- **Individual Post**: `GET /api/blogs?filters[slug]=${slug}&populate=*` - Fetches post by slug
- **Profile**: `GET /api/profile?populate=*` - Fetches profile information
- **Comments**: `GET /api/blogs/${blogId}?populate=comments` - Fetches comments via Blog relation
- **API Timeout**: 10-second timeout configured for all requests
- **Content Types**: Blog posts, Profile, and Comments with lowercase field names

## TypeScript Interfaces

The BlogPost, Profile, and Comment interfaces are defined in `src/lib/strapi.ts` with the current Strapi schema:

```typescript
interface BlogPost {
  id: number;
  documentId: string;
  slug: string; // UID field for URL routing (lowercase)
  title: string; // Post title (lowercase)
  content: string; // Markdown content (lowercase)
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  comments?: Comment[]; // Optional comments relation
}

interface Comment {
  id: number;
  documentId: string;
  author: string;
  email: string;
  content: string;
  blog: BlogPost;
  approved: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  id: number;
  documentId: string;
  title: string;
  biography: string;
  career: string;
  contact:
    | {
        email?: string;
        phone?: string;
        linkedin?: string;
        github?: string;
      }
    | string
    | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}
```

Strapi API functions are exported from `src/lib/strapi.ts`:

- `getBlogPosts()`: Fetches all published posts
- `getBlogPost(slug)`: Fetches single post by slug
- `getProfile()`: Fetches profile information for homepage display
- `getComments(blogId)`: Fetches comments via Blog's comments relation
- `createComment()`, `updateComment()`, `deleteComment()`: Comment CRUD operations

## Design System

- **Typography**: Pretendard Variable font for Korean text optimization
- **Styling**: Tailwind CSS v4 with mobile-first responsive design and OKLCH color system
- **Components**: React functional components with TypeScript
- **Content Rendering**: react-markdown for markdown content with custom styling
- **UI Components**: Reusable components in `src/components/ui/` (Button, Input, Textarea)
- **Dark Mode**: Full dark mode support with CSS variables and automatic system detection

## Routing Strategy

- **Dynamic Routes**: `/posts/[id]` where `id` is the slug field
- **Slug-based URLs**: Uses Strapi UID field for SEO-friendly URLs
- **API Filtering**: Queries Strapi by slug using `filters[slug]=${slug}`

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
6. **Comment Loading Issues**: Comments are fetched via Blog relation - ensure Blog populate includes comments
7. **Slow Performance**: Use server components for initial data fetching, client components only for interactions

## Performance & Caching

- **ISR (Incremental Static Regeneration)**: Pages revalidate every 5 minutes (300 seconds)
- **Static Generation**: Homepage and blog posts use static generation with ISR
- **Server-side Data Fetching**: Comments and posts fetched server-side for immediate display
- **Parallel Data Loading**: Posts and comments fetched concurrently using Promise.all
- **API Optimization**: 10-second timeout prevents hanging requests
- **Content Updates**: Strapi content changes appear within 5 minutes without manual deployment

## Deployment Script

```bash
# Quick deploy command (lint, build, commit, push)
npm run deploy
```

## Code Quality

Always run these commands before committing:

- `npm run lint` - ESLint checks for code quality
- `npm run build` - Verify production build succeeds

## Comment System

The blog includes a comprehensive comment system with hybrid rendering:

- **Server-side Initial Load**: Comments are fetched server-side for immediate display
- **Client-side Interactions**: Forms, modals, and real-time updates handled client-side
- **Email-based Authentication**: Users can edit/delete their own comments using email verification
- **CRUD Operations**: Full create, read, update, delete functionality
- **Performance Optimization**: Initial comments passed as props to avoid client-side loading
- **Modal UI**: Email verification modal for comment modifications
- **Error Handling**: Retry functionality and clear error states

### Comment Architecture

```typescript
// Server Component (PostPage)
const initialComments = await getComments(post.documentId);

// Client Component (CommentSection)
<CommentSection blogId={post.documentId} initialComments={initialComments} />
```

## Color System

Uses modern OKLCH color space for better color accuracy:

```css
:root {
  --background: oklch(100% 0 0);
  --foreground: oklch(15% 0 0);
  --lv1-background: oklch(96% 0.004 247);
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(7% 0 0);
    --foreground: oklch(92% 0 0);
    --lv1-background: oklch(21% 0.034 264.665);
  }
}
```

## Tailwind CSS v4

This project uses Tailwind CSS v4 with:

- **No config file**: Uses `@import "tailwindcss"` and `@plugin` directives in CSS
- **CSS-first approach**: Styles defined directly in `globals.css` with CSS variables
- **Typography plugin**: Custom prose styles for markdown content

## URL Handling

- **External Links**: LinkedIn and GitHub URLs are automatically prefixed with `https://` if missing to prevent 404 errors
- **Utility Function**: `ensureAbsoluteUrl()` in page components handles relative URL conversion
