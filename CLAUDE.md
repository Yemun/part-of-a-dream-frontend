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

# Quick deploy command (lint, build, commit, push)
npm run deploy
```

## Technology Stack

- **Framework**: Next.js 15.3.3 with App Router
- **React**: Version 19 with Server Components
- **TypeScript**: Strict type checking enabled
- **Styling**: Tailwind CSS v4
- **HTTP Client**: Axios
- **Markdown**: react-markdown for content rendering
- **Date Handling**: dayjs for Korean localization
- **Font**: Pretendard Variable for Korean text optimization (loaded via CDN)

## Environment Configuration

Required environment variables in `.env.local`:

```
NEXT_PUBLIC_STRAPI_URL=https://appealing-badge-1cb5ca360d.strapiapp.com
REVALIDATE_TOKEN=your-webhook-token-for-auto-revalidation
```

**Production Configuration**:
- **Vercel**: Set both environment variables in project settings
- **Domain**: Production URL hardcoded as `https://yemun.kr` in sitemap and metadata
- **REVALIDATE_TOKEN**: Used for webhook authentication and manual cache invalidation

## Architecture & Data Flow

The application uses a hybrid server/client architecture for optimal performance:

1. **Strapi Cloud Backend**: Content management and API endpoints
2. **Next.js Server Components**: Initial data fetching and SSR
3. **Client Components**: Interactive features (comments, forms)
4. **Deployment**: Vercel hosting with automatic deployments

### Rendering Strategy

- **Server Components**: Posts, profile, and initial comment data are fetched server-side for SEO and performance
- **Client Components**: Interactive elements (forms, modals, real-time updates)
- **Hybrid Approach**: Combines SSR performance with client-side interactivity
- **Data Passing**: Server-fetched data passed as props to client components

#### Key API Integration

**Strapi Cloud API Endpoints**:
- **Blog Posts**: `GET /api/blogs?populate=*` - Fetches all published posts
- **Individual Post**: `GET /api/blogs?filters[slug]=${slug}&populate=*` - Fetches post by slug
- **Profile**: `GET /api/profile?populate=*` - Fetches profile information
- **Comments**: `GET /api/blogs/${blogId}?populate=comments` - Fetches comments via Blog relation
- **Content Types**: Blog posts, Profile, and Comments with lowercase field names

**Next.js API Routes**:
- **`/api/comments/[blogId]`**: Client-side comment fetching with 5-second timeout and optimized field selection
- **`/api/revalidate`**: Webhook endpoint for automatic cache invalidation with Bearer token authentication
- **Timeout Strategy**: 10-second timeout for main Strapi client, 5-second timeout for comment API routes

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

- `getBlogPosts()`: Fetches all published posts with memory caching
- `getPostWithDetails(slug)`: Unified function fetching post, adjacent posts, and comments in parallel
- `getProfile()`: Fetches profile information for homepage display
- `getComments(blogId)`: Fetches comments via Blog's comments relation with 5-second timeout (server-side only)
- `createComment()`, `updateComment()`, `deleteComment()`: Comment CRUD operations with automatic cache invalidation and revalidation

## Component Architecture

Components are organized by feature for better maintainability:

```
src/components/
├── layout/           # Page layout and navigation
├── post/             # Blog post related components (PostCard, MarkdownRenderer, PostNavigation)
├── comment/          # Comment system (CommentForm, CommentList, CommentSection)
├── common/           # Shared utilities (RelativeTime with absolute/relative options)
└── ui/               # Base UI components (Button, Input, Textarea) with shared formStyles
```

### Key Components

- **PostCard**: Unified component handling both blog posts (with SVG circular text) and placeholder states
- **RelativeTime**: Supports both relative ("2일 전") and absolute ("6월 22일 금요일") time display
- **Form Components**: Shared styling via `formStyles.ts` utility with consistent focus states

## Design System

- **Styling**: Tailwind CSS v4 with mobile-first responsive design
- **Components**: React functional components with TypeScript
- **Content Rendering**: react-markdown for markdown content with custom styling
- **UI Components**: Reusable components with shared styling utilities
- **Dark Mode**: Full dark mode support with CSS variables and automatic system detection
- **Patterns**: Dot-pattern backgrounds (`.dot-pattern` class) with light/dark mode variants

## Routing Strategy

- **Dynamic Routes**: `/posts/[id]` where `id` is the slug field
- **Slug-based URLs**: Uses Strapi UID field for SEO-friendly URLs
- **API Filtering**: Queries Strapi by slug using `filters[slug]=${slug}`

## Localization Features

- **Date Formatting**: Korean format with RelativeTime component supporting both relative and absolute formats
- **Content**: Korean language interface and content

## Mobile Responsiveness

Implements mobile-first design with Tailwind breakpoints:

- Base styles for mobile (< 640px)
- `sm:` prefix for desktop (≥ 640px)
- Responsive typography, spacing, and layout adjustments

## Next.js 15 Compatibility

This project uses Next.js 15 which has breaking changes:

- **Dynamic Route Params**: `params` in page components is now a Promise and must be awaited
- **Example**: `const { id } = await params;` instead of `params.id`

## Next.js Configuration

**Performance Optimizations** (`next.config.ts`):
- **Image Optimization**: WebP and AVIF format support enabled
- **Compression**: Built-in gzip/brotli compression
- **Preconnect Headers**: Automatic preconnect to Strapi backend for performance
- **TypeScript**: Strict mode with path aliases (`@/*` maps to `src/*`)

## Deployment

**Automated via GitHub Actions**:

- Pushes to main branch trigger automatic Vercel deployment via `.github/workflows/deploy.yml`
- Workflow includes linting and build verification with Node.js 18
- Requires GitHub Secrets: `VERCEL_TOKEN`, `ORG_ID`, `PROJECT_ID`

**Manual Vercel Deployment**:

- Import GitHub repository at https://vercel.com/new
- Set environment variables: `NEXT_PUBLIC_STRAPI_URL`, `REVALIDATE_TOKEN`

## Common Issues

1. **Build Errors on Vercel**: Ensure all dependencies are in package.json and committed to GitHub
2. **API Connection**: Verify NEXT_PUBLIC_STRAPI_URL environment variable is set correctly
3. **Content Not Displaying**: Check Strapi Cloud API permissions for access to Blog content type
4. **Korean Font Issues**: Pretendard font is loaded via CDN in globals.css
5. **Next.js 15 Params**: Remember to await params in dynamic routes
6. **Comment Loading Issues**: Comments are fetched via Blog relation - ensure Blog populate includes comments
7. **Slow Performance**: Use server components for initial data fetching, client components only for interactions

## Performance & Cache Management

### Caching Strategy
- **On-Demand Revalidation**: Post pages use on-demand revalidation for optimal API cost efficiency
- **ISR for Static Content**: Homepage and profile pages revalidate weekly (604800 seconds)
- **Memory Caching**: 5-minute TTL cache for API responses to reduce redundant calls
- **Cache Keys**: Specific patterns (`post-details-${slug}`, `comments-${blogId}`, `blog-posts`)
- **Cache Invalidation**: Automatic cache clearing on comment CRUD operations affecting multiple cache keys

### Performance Optimizations
- **Server-side Data Fetching**: Comments and posts fetched server-side for immediate display
- **Parallel Data Loading**: Posts and comments fetched concurrently using Promise.all
- **Dual Timeout Strategy**: 10-second timeout for main API, 5-second timeout for comment endpoints
- **Optimized Field Selection**: API queries request only necessary fields for performance
- **Fallback Mechanisms**: Graceful degradation with empty arrays on API failures

### Server Actions
- **Server Actions**: Defined in `src/lib/actions.ts` for revalidation operations
- **Revalidation Pattern**: `revalidatePostPages()` called after comment CRUD operations

```typescript
// After comment operations in strapi.ts
await revalidatePostPages(); // Triggers revalidation of affected pages
```

### API Cost Optimization
- **From**: Automatic revalidation every 60 seconds (2,880+ API calls/day)
- **To**: On-demand revalidation only when content changes (99% reduction)
- **Memory Cache**: 5-minute TTL reduces redundant API calls during user sessions

## SEO & Metadata System

### Shared Metadata Utilities

The application uses a centralized metadata system in `src/lib/metadata.ts` to eliminate code duplication:

```typescript
// Create consistent metadata across pages
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Page Title",
  description: "Page description",
  keywords: ["additional", "keywords"],
  type: "article" | "website" | "profile"
});
```

### SEO Features

- **robots.txt**: Configures search engine crawling directives
- **Dynamic Sitemap**: Auto-generates sitemap.xml with all published posts
- **Structured Data**: JSON-LD schemas for Article and Person types
- **Open Graph & Twitter Cards**: Social media preview optimization
- **Language Declaration**: Proper `lang="ko"` for Korean content
- **Canonical URLs**: Prevents duplicate content issues

### Automatic Revalidation System

**Webhook Endpoint**: `/api/revalidate` handles Strapi Cloud webhooks for automatic cache invalidation when content changes.

**Setup Requirements**:
1. Set `REVALIDATE_TOKEN` environment variable
2. Configure Strapi webhook: `https://yemun.kr/api/revalidate` with Bearer token
3. Enable events: `entry.create`, `entry.update`, `entry.delete`, `entry.publish`, `entry.unpublish`

**Authentication**: Bearer token system with request validation and event filtering (only blog-related events processed).

**Manual Revalidation**: Same endpoint supports manual cache clearing with proper token authentication.

**Health Check**: `GET /api/revalidate` provides endpoint status monitoring.

Detailed setup instructions available in `WEBHOOK_SETUP.md`.

## Code Quality & Build Requirements

**Pre-commit Checklist** (IMPORTANT - always run before committing):

- Run `npm run lint` and fix all errors (warnings acceptable)
- Run `npm run build` to verify production build
- Test locally with `npm run dev`

```bash
npm run lint    # Fix all ESLint errors (warnings OK)
npm run build   # Ensure production build succeeds
```

**Common Build Issues**:

- ESLint errors will fail the build (warnings are acceptable)
- TypeScript type errors must be resolved
- Missing environment variables will cause build failures

**Code Conventions**:

- Use TypeScript strict mode
- Follow feature-based component organization (see Component Architecture section)
- Prefer Server Components for data fetching
- Use Client Components only for interactivity
- Implement proper error boundaries and fallbacks

## Comment System

The blog includes a comprehensive comment system with hybrid rendering:

- **Server-side Initial Load**: Comments are fetched server-side for immediate display
- **Client-side Interactions**: Forms, modals, and real-time updates handled client-side
- **Email-based Authentication**: Users can edit/delete their own comments using email verification
- **CRUD Operations**: Full create, read, update, delete functionality
- **Approval System**: Only approved comments are displayed to users
- **Performance Optimization**: Dedicated `/api/comments/[blogId]` endpoint with 5-second timeout
- **Modal UI**: Email verification modal for comment modifications
- **Error Handling**: Retry functionality, clear error states, and graceful fallbacks
- **Dual API Strategy**: documentId first, fallback to id for Strapi compatibility

### Comment Architecture

```typescript
// Server Component (PostPage) - loads comments server-side
const { post, adjacentPosts, comments } = await getPostWithDetails(slug);

// Client Component receives server data
<CommentSection blogId={post.documentId} initialComments={comments} />

// Client API used only for CRUD operations
fetch(`/api/comments/${post.documentId}`) // Only after comment add/edit/delete
```

**Key Implementation Details**:
- **Initial Load**: Comments fetched server-side via `getComments()` and passed as `initialComments`
- **Client API**: `/api/comments/[blogId]` used only for CRUD operations, not initial load
- **API Cost Optimization**: 90% reduction by eliminating client-side initial fetches
- **Fallback**: If no `initialComments`, client loads via API route
- Comment creation requires documentId for proper Strapi relation setup

## Color System

Uses modern OKLCH color space for better color accuracy:

```css
:root {
  --background: oklch(100% 0 0);
  --foreground: oklch(15% 0 0);
  --dot-pattern: url("data:image/svg+xml,..."); /* Black dots for light mode */
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: oklch(7% 0 0);
    --foreground: oklch(92% 0 0);
    --dot-pattern: url("data:image/svg+xml,..."); /* White dots for dark mode */
  }
}
```

### CSS Utilities

- `.dot-pattern`: Applies repeating dot background pattern with automatic dark mode support
- `.text-stroke-effect`: Adds text outline using background color for better readability

## Tailwind CSS v4

This project uses Tailwind CSS v4 with:

- **No config file**: Uses `@import "tailwindcss"` and `@plugin` directives in CSS
- **CSS-first approach**: Styles defined directly in `globals.css` with CSS variables
- **Typography plugin**: Custom prose styles for markdown content
- **PostCSS Configuration**: Uses `@tailwindcss/postcss` plugin in `postcss.config.js`
- **Theme Configuration**: CSS variables defined with `@theme inline` directive

## Development Guidelines

### Form Components

When creating or modifying form inputs, use the shared `getFormFieldClasses()` utility from `src/components/ui/formStyles.ts` to ensure consistent styling across Input and Textarea components. This utility handles:

- Base form field styling with proper focus states
- Error state styling
- Dark mode compatibility
- Consistent outline behavior in Tailwind CSS v4

### Time Display

Use `RelativeTime` component with the `absolute` prop for post detail pages:

```tsx
<RelativeTime dateString={post.publishedAt} absolute />  // "6월 22일 금요일"
<RelativeTime dateString={post.publishedAt} />          // "2일 전"
```

### Metadata Implementation

When adding metadata to new pages, always use the shared utility:

```typescript
// For static metadata
export const metadata = createMetadata({ title: "Page Title" });

// For dynamic metadata
export async function generateMetadata({ params }): Promise<Metadata> {
  const data = await fetchData(params.id);
  return createMetadata({
    title: data.title,
    description: extractDescription(data.content),
    type: "article"
  });
}
```

### SEO Schema Implementation

For blog posts, use the Article schema helper:

```typescript
const articleSchema = createArticleSchema({
  title: post.title,
  description: extractDescription(post.content),
  author: "Author Name",
  publishedTime: post.publishedAt,
  modifiedTime: post.updatedAt,
  slug: post.slug
});
```

## Key Architectural Decisions

### Korean Localization Architecture

- **Date Formatting**: dayjs with Korean locale for relative/absolute time display
- **Content Strategy**: Korean-first interface with proper typography and spacing
