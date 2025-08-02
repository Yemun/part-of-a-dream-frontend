# CLAUDE.md

Multilingual blog "꿈의 일환" (Part of a Dream) - Next.js with next-intl, Contentlayer & Supabase

## Quick Start

```bash
npm run dev     # Development server
npm run build   # Production build 
npm run lint    # ESLint check
npm run deploy  # Build, commit, and deploy
```

## Tech Stack

- **Next.js 15.3.3** with App Router
- **next-intl 4.3.4** for internationalization
- **Contentlayer2** for MDX content management
- **Supabase** for comments system
- **Tailwind CSS v4** for styling
- **TypeScript** with strict checking

## Internationalization

### Supported Languages
- **Korean (ko)**: Default language - `/` 
- **English (en)**: Secondary language - `/en`

### URL Structure
- Homepage: `/` (Korean), `/en` (English)
- Posts: `/posts/[slug]` (Korean), `/en/posts/[slug]` (English)
- Profile: `/profile` (Korean), `/en/profile` (English)

### Language Switching
- Automatic locale detection via middleware
- Manual language switcher in navigation
- Preserves current page when switching languages

## Architecture

### Content System
- **Content**: MDX files in `./content/posts/`
- **Generation**: Static at build time via Contentlayer
- **Types**: Auto-generated from `.contentlayer/generated`
- **Localization**: Metadata and UI text via next-intl

### Key Components
- **PostCard**: Circular SVG design with random positioning
- **MDXRenderer**: Pre-compiled MDX with syntax highlighting
- **CommentSection**: Supabase-powered with optimistic updates
- **LanguageSwitcher**: Language toggle in navigation

### Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Content Creation

Create `.mdx` files in `content/posts/`:

```yaml
---
title: "Post Title"
publishedAt: "2024-01-01"
description: "Optional description"
tags: ["tag1", "tag2"]
---

# Your content here
```

## Build Requirements

```bash
npm run lint    # Must pass (warnings OK)
npm run build   # Must succeed
```

## Deployment

Auto-deploys to Vercel on main branch push via GitHub Actions.