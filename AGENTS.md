# AGENTS.md

Multilingual blog "꿈의 일환" (Part of a Dream) - Next.js with next-intl, Contentlayer & Supabase

## Quick Start

```bash
npm run dev     # Development server
npm run build   # Production build 
npm run lint    # ESLint check
npm run deploy  # Build, commit, and deploy
npm run sync    # Pull posts/work docs + images from the Obsidian vault, commit, push
```

## Tech Stack

- **Next.js 16** with App Router (Turbopack)
- **React 19**
- **next-intl 4.7** for internationalization
- **Contentlayer2** for MDX content management (`BlogPost` + `Work` document types)
- **Supabase** for comments and side-project data (`bingo_*`, `jangbogi_*` tables)
- **Tailwind CSS v4** for styling
- **TypeScript** with strict checking

## Internationalization

### Supported Languages
- **Korean (ko)**: Default language - `/` 
- **English (en)**: Secondary language - `/en`

### URL Structure
- Homepage (Work list): `/` (Korean), `/en` (English)
- Work detail: `/work/[slug]` (Korean), `/en/work/[slug]` (English)
- Blog index: `/posts` → redirects to the latest post
- Posts: `/posts/[id]` (Korean), `/en/posts/[id]` (English) — rendered inside the two-column blog layout
- Profile: `/profile` (Korean), `/en/profile` (English)
- Side Project: `/side-project?tab=jangbogi|bingo|palette` (tab toggle, default `jangbogi`)

### Language Switching
- Automatic locale detection via middleware
- Manual language switcher in navigation
- Preserves current page when switching languages

## Architecture

### Content System
- **Content**: MDX files in `./content/posts/` (blog) and `./content/work/` (portfolio)
- **Generation**: Static at build time via Contentlayer
- **Types**: Auto-generated from `.contentlayer/generated` (`allBlogPosts`, `allWorks`)
- **Localization**: Metadata and UI text via next-intl. Locale comes from the filename suffix (`-ko` / `-en`), and the suffix is stripped to form the shared `slug`
- **Markdown pipeline**: `src/lib/mdx/remark-obsidian.mjs` → rehype (slug, pretty-code, autolink, unwrap-images). No GFM extensions (footnotes, tables) are enabled

### Navigation
Top nav order: **업무(Work) → 블로그 → 프로필 → 사이드 프로젝트** (`NavigationClient`). Work is active on `/` and `/work/*`; Blog on `/posts/*`.

### Key Components
- **PostCard**: Circular SVG design with random positioning. Generic: `href` (default `/posts/[slug]`) and `dateLabel` props let the Work list reuse it
- **BlogSideNav** (`src/components/post/`): year-grouped post list for the blog layout. Sticky left sidebar on `lg` and up only; hidden on mobile/tablet
- **WorkSummaryCards** (`src/components/work/`): frontmatter summary grid above a Work article. Row 1: product (falls back to company) / role / period+duration; row 2: problem | impact side by side; tags row only when present. Empty fields drop out
- **MDXRenderer**: Pre-compiled MDX with syntax highlighting (shiki dual theme; `globals.css` pins the dark palette because `.prose pre` is always dark). `components` map overrides `img`, `Iframe`, and `PaletteEntry`
- **CommentSection**: Supabase-powered with optimistic updates
- **LanguageSwitcher**: Language toggle in navigation
- **MobileContainer** (`src/components/side-project/`): 390×844 phone-shaped frame used by `/side-project`
- **SideProjectSubNav** (`src/components/layout/`): 2-depth nav row, only renders on `/side-project` paths

## Work (Portfolio)

`/` lists `Work` documents with the same year-rail + circular-card UI the blog used to have; each card links to `/work/[slug]`. The year rail and the sort order use the **end date** (`getWorkEndDate`): ongoing work (empty `endDate`) counts as today, so it sits under the current year at the top.

- **Source**: Obsidian vault `2 정리/포트폴리오/*.md`. Only files listed in `WORK_FILES` inside `scripts/sync-obsidian.sh` are copied to `content/work/` — add a filename there to publish another doc.
- **Frontmatter**: `title`, `description`, `category`, `company`, `role`, `startDate`, `endDate` (empty = ongoing), `problem[]`, `impact[]`, `tags[]`, `product`, `productDescription`. Only `title` and `startDate` are required.
- **Locale fallback**: `getWorks(locale)` / `getWorkBySlug()` fall back to every document when the locale has none, so `/en` still shows the Korean entries.
- **Obsidian syntax** handled by `remark-obsidian`: `![[image.png]]` / `![[image.png|caption]]` → `/images/image.png` with the caption as alt; a bare filename in standard syntax (`![caption](image.png)`) is also prefixed with `/images/`; a paragraph that is exactly `[PaletteEntry.tsx]` → inline `<PaletteEntry />` wrapped in a 0.5px outlined box (allow-list in the plugin); raw `<iframe>` → `<Iframe>` component (string `style` is parsed, `allowfullscreen` mapped); code-fence languages are lower-cased.
- Work pages have prev/next links (`PostNavigation` with `basePath="/work"`, labels from `work.navigation.*`) following the same end-date order as the list. No comments.

## Blog Layout

`src/app/[locale]/posts/layout.tsx` wraps `/posts` and `/posts/[id]` with `BlogSideNav` on the left and the article (pinned to `max-w-2xl` right next to it) on the right. `/posts` itself redirects to the newest post, so the sidebar is the only list view, and it only appears on `lg`+ viewports.

## Side Projects

`/side-project` hosts three projects switched by the `?tab=` query param. Bingo and Jangbogi render inside `MobileContainer`; Palette renders in a plain `max-w-2xl` column:

- **Bingo** — React. Entry: `src/components/side-project/bingo/BingoEntry.tsx` → `BingoBoard`. GPS-based 3×3 board, Supabase tables `bingo_*`. Styles in `bingo.css`; the `font-bingo` class scopes system fonts so the site's Pretendard body font does not leak into the bingo UI.
- **Jangbogi** (장보기) — vanilla HTML/JS/CSS SPA served from `public/jangbogi/` and embedded via iframe by `JangbogiFrame`. Supabase tables `jangbogi_*`. No build step. Same-origin, so no CSP/CORS concerns.
- **Palette** (컬러 관여도) — `src/components/side-project/palette/PaletteEntry.tsx`. Also embeddable inside Work articles via the `[PaletteEntry.tsx]` placeholder.

Tab switching: `SideProjectSubNav` reads `?tab=` via `useSearchParams` and renders the active link with `font-semibold underline`. The component returns `null` outside `/side-project`, so the sub-nav row only appears when relevant.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Content Creation

Blog posts go in `content/posts/`:

```yaml
---
title: "Post Title"
publishedAt: "2024-01-01"
description: "Optional description"
tags: ["tag1", "tag2"]
---

# Your content here
```

Work entries go in `content/work/` (normally via `npm run sync`):

```yaml
---
title: KDS 운영
description: 한 줄 요약
company: 케이뱅크
role: 디자인 시스템 운영
startDate: 2024-01-01
endDate:            # empty = ongoing
impact:
  - 성과 1
tags: [design-system]
product: Kbank Design System
productDescription: 제품 한 줄 설명
---
```

## Deployment

`npm run deploy` runs lint → build → commit → push to `main`. Vercel auto-deploys on push via GitHub Actions. Lint must pass (warnings OK) and build must succeed before push.