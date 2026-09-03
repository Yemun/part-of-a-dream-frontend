# AGENTS.md

Multilingual blog "꿈의 일환" (Part of a Dream) - Next.js with next-intl, Contentlayer & Supabase

## Quick Start

```bash
npm run dev     # Development server
npm run build   # Production build 
npm run lint    # ESLint check
npm run deploy  # Build, commit, and deploy
```

## Tech Stack

- **Next.js 16** with App Router (Turbopack)
- **React 19**
- **next-intl 4.7** for internationalization
- **Contentlayer2** for MDX content management
- **Supabase** for comments and side-project data (`bingo_*`, `jangbogi_*` tables)
- **Tailwind CSS v4** for styling
- **TypeScript** with strict checking

## Internationalization

### Supported Languages
- **Korean (ko)**: Default language - `/` 
- **English (en)**: Secondary language - `/en`

### URL Structure
- Homepage: `/` (Korean), `/en` (English)
- Posts: `/posts/[id]` (Korean), `/en/posts/[id]` (English)
- Profile: `/profile` (Korean), `/en/profile` (English)
- Side Project: `/side-project?tab=jangbogi|bingo` (tab toggle, default `jangbogi`)

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
- **MobileContainer** (`src/components/side-project/`): 390×844 phone-shaped frame used by `/side-project`
- **SideProjectSubNav** (`src/components/layout/`): 2-depth nav row, only renders on `/side-project` paths

## Side Projects

`/side-project` hosts two projects switched by the `?tab=` query param, both rendered inside `MobileContainer`:

- **Bingo** — React. Entry: `src/components/bingo/BingoEntry.tsx` → `BingoBoard`. GPS-based 3×3 board, Supabase tables `bingo_*`. Styles in `bingo.css`; the `font-bingo` class scopes system fonts so the site's ChosunIlboMyungjo body font does not leak into the bingo UI.
- **Jangbogi** (장보기) — vanilla HTML/JS/CSS SPA served from `public/jangbogi/` and embedded via iframe by `JangbogiFrame`. Supabase tables `jangbogi_*`. No build step. Same-origin, so no CSP/CORS concerns.

Tab switching: `SideProjectSubNav` reads `?tab=` via `useSearchParams` and renders the active link with `font-semibold underline`. The component returns `null` outside `/side-project`, so the sub-nav row only appears when relevant.

## Environment Variables

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

## Deployment

`npm run deploy` runs lint → build → commit → push to `main`. Vercel auto-deploys on push via GitHub Actions. Lint must pass (warnings OK) and build must succeed before push.