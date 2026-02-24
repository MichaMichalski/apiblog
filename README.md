# Static CMS

A self-hosted, WordPress-like CMS built with Next.js that generates static pages for SEO, manages themes via JSON, and provides a full REST API for content management.

## Quick Start

```bash
# Install dependencies
npm install

# Run database migration and seed with default admin user
npm run setup

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

**Default login:**
- Email: `admin@example.com`
- Password: `admin123`

## Features

- **Static Page Generation** — Public pages are statically generated at build time with on-demand revalidation for SEO
- **JSON Theme System** — Change the theme via DB/API/Admin-UI to completely reskin the site without touching code
- **Block-based Content** — Posts and pages are structured as JSON blocks (paragraphs, headings, images, code, quotes, ads, lists)
- **REST API** — Full CRUD for posts, pages, themes, and media uploads via `/api/v1/`
- **SEO Suite** — Sitemap.xml, robots.txt, Open Graph, Twitter Cards, JSON-LD Structured Data, canonical URLs, meta robots
- **SEO Analysis** — Yoast-like real-time SEO scoring in the admin editor (keyword density, title length, meta description, readability)
- **Cookie Consent** — GDPR-compliant consent banner with configurable analytics/advertising categories
- **Google Analytics & AdSense** — Integrated with consent-gated loading
- **Admin Panel** — Dashboard, post/page editors with live preview and SEO analysis, theme editor, media library
- **No Breaking Changes** — API versioning, Prisma migrations, and schema versioning

## Configuration Files

| File | Purpose |
|------|---------|
| `src/config/site.json` | Site name, description, navigation, footer |
| `src/config/consent.json` | Cookie consent categories and analytics/ad script config |
| `src/config/theme.json` | Default theme (fallback; active theme is stored in DB) |

## Theme System

The theme is stored in the database and can be edited via:
- **Admin UI**: `/admin/theme` — visual editor with preset support
- **REST API**: `GET /PUT /api/v1/theme`

Presets are available under `public/themes/` and can be applied from the Admin Theme Editor.

See [docs/theme.md](docs/theme.md) for the full theme JSON specification.

## SEO Features

The CMS includes a comprehensive SEO suite comparable to Yoast SEO:

| Feature | Description |
|---------|-------------|
| `/sitemap.xml` | Dynamic sitemap with all published posts and pages |
| `/robots.txt` | Blocks `/admin/` and `/api/`, references sitemap |
| Open Graph | `og:title`, `og:description`, `og:image`, `og:type` on all pages |
| Twitter Cards | `summary` or `summary_large_image` based on featured image |
| JSON-LD | `Article`, `WebPage`, `WebSite` schemas for rich snippets |
| Canonical URLs | Auto-generated or custom per post/page |
| Meta Robots | `noindex` option per post/page |
| Focus Keyword | Keyword tracking with density analysis |
| SEO Score | Real-time analysis panel in the admin editor |
| Reading Time | Auto-calculated and displayed on blog posts |

All SEO fields are available via the REST API (`focusKeyword`, `noIndex`, `canonicalUrl`, `seoTitle`, `seoDescription`).

See [docs/seo.md](docs/seo.md) for the full SEO documentation.

## REST API

All endpoints require either session auth (from admin login) or an `x-api-key` header.

```
POST   /api/v1/posts          Create post (with SEO fields)
GET    /api/v1/posts          List posts (supports ?page, ?limit, ?status)
GET    /api/v1/posts/:id      Get post (includes SEO fields)
PUT    /api/v1/posts/:id      Update post (SEO fields individually updateable)
DELETE /api/v1/posts/:id      Delete post

POST   /api/v1/pages          Create page (with SEO fields)
GET    /api/v1/pages          List pages
GET    /api/v1/pages/:id      Get page (includes SEO fields)
PUT    /api/v1/pages/:id      Update page (SEO fields individually updateable)
DELETE /api/v1/pages/:id      Delete page

GET    /api/v1/theme          Get current theme
PUT    /api/v1/theme          Update theme

POST   /api/v1/upload         Upload media (multipart/form-data)
GET    /api/v1/upload         List all media

POST   /api/v1/auth/login     Login
POST   /api/v1/auth/logout    Logout
GET    /api/v1/auth/session   Check session
POST   /api/v1/auth/change-password  Change password
```

### Creating a Post via API (with SEO)

```bash
curl -X POST http://localhost:3000/api/v1/posts \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "title": "My Post",
    "slug": "my-post",
    "status": "published",
    "excerpt": "A short summary",
    "seoTitle": "My Post - Best Tips",
    "seoDescription": "A comprehensive guide with the best tips and tricks.",
    "focusKeyword": "best tips",
    "noIndex": false,
    "content": [
      { "type": "paragraph", "content": "Hello world!" },
      { "type": "image", "src": "/uploads/photo.jpg", "alt": "Photo", "position": "full" },
      { "type": "ad", "provider": "adsense", "slot": "1234567890", "format": "in-article" },
      { "type": "paragraph", "content": "More text after the ad." }
    ]
  }'
```

## Docker Deployment

```bash
# Build and run
docker compose up -d

# View logs
docker compose logs -f
```

Set environment variables in `.env` or directly in `docker-compose.yml`:
- `SESSION_SECRET` — Random 32+ character secret for session encryption
- `API_KEY` — API key for REST API authentication
- `NEXT_PUBLIC_SITE_URL` — Public URL of the site (used for sitemap, canonical URLs, OG tags)

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | SQLite database path | `file:./data/blog.db` |
| `SESSION_SECRET` | Session encryption key | (change in production) |
| `API_KEY` | REST API authentication key | (change in production) |
| `NEXT_PUBLIC_SITE_URL` | Public site URL (sitemap, canonical, OG) | `http://localhost:3000` |

## Documentation

| Document | Content |
|----------|---------|
| [docs/seo.md](docs/seo.md) | SEO & Analytics (sitemap, OG, JSON-LD, keyword analysis, consent) |
| [docs/content-blocks.md](docs/content-blocks.md) | Block-based content system, post/page schemas, API examples |
| [docs/theme.md](docs/theme.md) | Theme JSON structure, CSS variables, API access |

## Project Structure

```
src/
  app/
    (public)/          Static public pages (SSG)
    admin/             Admin panel (dynamic)
    api/v1/            REST API routes
    sitemap.ts         Dynamic sitemap.xml generation
    robots.ts          Robots.txt generation
  components/
    blocks/            Content block renderers
    admin/             Admin UI components (incl. SeoAnalysis panel)
    consent/           Cookie consent system
    public/            Public layout components
    seo/               JSON-LD structured data components
    theme/             Theme provider
  lib/
    db.ts              Prisma client
    auth.ts            Session & API key authentication
    blocks.ts          Zod schemas for blocks, posts, pages
    seo.ts             SEO utilities, text analysis, keyword scoring
    theme.ts           Theme loading & CSS generation
    revalidate.ts      On-demand revalidation helpers
  config/              JSON configuration files (site, consent, theme)
  styles/              CSS files (theme variables, components, globals)
docs/
  seo.md               SEO & Analytics documentation
  content-blocks.md    Content block documentation
  theme.md             Theme JSON documentation
```
