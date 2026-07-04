# Lumo Lab — Түрээсийн систем

Rental management app for Lumo Lab. Track inventory, build orders, calculate pricing, generate PDF contracts, and manage active rentals — backed by [Cloudflare D1](https://developers.cloudflare.com/d1/).

Built with **Next.js 16** (App Router), **React 19**, and TypeScript.

## Features

- **Inventory** — browse, filter, add, edit, and delete equipment with live stock counts
- **New rental** — cart-based checkout with duration pricing, VAT mode, and free-stand rules
- **Active / history** — return rentals, export PDF contracts, delete records individually or in bulk
- **Activity log** — audit trail for inventory and rental actions
- **Theme & preferences** — dark/light mode and UI filters persisted in a cookie
- **Mongolian UI** — labels and copy in Mongolian

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16, React 19 |
| Database | Cloudflare D1 (SQLite) |
| Validation | Zod |
| PDF | jsPDF |
| Styling | Custom CSS (`app/lumo-lab.css`) |

## Prerequisites

- Node.js 20+
- A Cloudflare account with a D1 database named `lumolab-rental`
- Cloudflare API token with D1 read/write access

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd lumolab-rental
   npm install
   ```

2. **Environment variables**

   Create `.env` in the project root:

   ```env
   CF_USER_ID=your_cloudflare_account_id
   CF_DB_ID=your_d1_database_id
   CF_API_KEY=your_cloudflare_api_token
   ```

   The database ID is in `wrangler.jsonc` or the Cloudflare dashboard under D1.

3. **Run migrations**

   ```bash
   # Remote (production D1)
   npm run db:migrate

   # Local D1 (Wrangler dev)
   npm run db:migrate:local
   ```

   Migrations live in `migrations/` and create `inventory`, `rentals`, `rental_items`, and `activity_log` tables. `0002_seed_inventory.sql` seeds starter equipment if present.

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply migrations to remote D1 |
| `npm run db:migrate:local` | Apply migrations to local D1 |

## API routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/inventory` | List inventory |
| `POST` | `/api/inventory` | Add item |
| `PATCH` | `/api/inventory` | Update item field or flags |
| `DELETE` | `/api/inventory` | Delete item |
| `GET` | `/api/rentals` | List rentals |
| `POST` | `/api/rentals` | Create rental (checkout) |
| `DELETE` | `/api/rentals` | Delete all rentals |
| `POST` | `/api/rentals/[id]/return` | Mark rental returned |
| `DELETE` | `/api/rentals/[id]` | Delete one rental |
| `GET` | `/api/activity` | List activity log |
| `DELETE` | `/api/activity` | Delete log entry or all logs |

## Project structure

```
app/
  api/           # REST API routes
  layout.tsx     # Root layout, theme init script
  page.tsx       # Main app entry
components/rental/   # UI panels, hooks, dialogs
lib/
  db/            # D1 client, repository, mappers
  rental/        # Pricing, types, user settings
  api/           # Zod schemas, activity logging
  pdf/           # Contract PDF generation
migrations/      # D1 SQL migrations
public/          # Logos and static assets
```

## Deployment

The app is a standard Next.js project. Deploy to [Vercel](https://vercel.com) or any Node host and set `CF_USER_ID`, `CF_DB_ID`, and `CF_API_KEY` in the environment. Run `npm run db:migrate` against your production D1 database before going live.

## License

Private — Lumo Lab internal use.
