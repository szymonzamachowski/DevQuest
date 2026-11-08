# DevQuest

<p align="center">
  <img src="public/brand/logo.png" alt="DevQuest logo" width="96" height="96" />
</p>

<p align="center">
  Career-grade software project simulations for students and junior developers.
</p>

> **Status: work in progress.** Core MVP features below are implemented, with unit (Vitest) and e2e (Playwright) tests in CI. Not deployed publicly yet.

---

## Problem

Junior developers and CS students often lack realistic, portfolio-ready project experience. Coursework rarely reproduces the full delivery loop: scoping, teamwork, client communication, code review, quality trade-offs, and release.

## Solution

DevQuest simulates a product delivery campaign. Teams (or solo players) run a structured software project with quests, XP, project health, client decisions, achievements, and a final report — ending in an optional public portfolio page.

## Features (MVP)

- **Campaign catalog** — browse published simulations (e.g. _Booking Crisis_)
- **Project setup** — solo or team mode, role selection, stack assessment
- **Quest workflow** — Kanban board, GitHub commit/PR submissions, leader review
- **XP & skills** — deterministic XP awards mapped to skill categories
- **Project Health** — rule-based health changes from delivery and client events
- **Client Inbox** — timed client messages with team decisions
- **Achievements** — milestone unlocks during the campaign
- **Campaign completion** — leader/solo finalization with repository and demo URLs
- **Final report** — deterministic team and individual reports (no AI)
- **Public project page** — recruiter-friendly portfolio view
- **User profile** — XP, skills, completed campaigns, public projects
- **Demo mode** — one-click login and seeded demo data
- **i18n** — English and Polish (`next-intl`)

## Screenshots

| Campaign dashboard                     | Quest board                            | Public portfolio               |
| -------------------------------------- | -------------------------------------- | ------------------------------ |
| _Add screenshot after running locally_ | _Add screenshot after running locally_ | `/projects/brightlane-booking` |

Replace placeholders with captures from your local build before publishing the repository.

## Tech stack

| Layer         | Technology                                                          |
| ------------- | ------------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router), React 19, TypeScript (strict)              |
| Styling       | Tailwind CSS 4, shadcn/ui, pixel-art design tokens in `globals.css` |
| Database      | PostgreSQL 16, Prisma ORM                                           |
| Auth          | Auth.js (NextAuth) credentials provider, bcrypt password hashing    |
| i18n          | next-intl (EN / PL)                                                 |
| Drag and drop | @dnd-kit (quest board)                                              |
| Unit tests    | Vitest, Testing Library                                             |
| E2E tests     | Playwright                                                          |
| CI            | GitHub Actions                                                      |

## Architecture

```
src/
├── app/                    # App Router routes (public + /app workspace)
├── components/             # Shared UI, layout shell, brand
├── features/               # Feature modules (campaigns, quests, inbox, completion…)
├── lib/                    # Services, permissions, DB, auth helpers
├── config/                 # Health rules, stack rules
├── messages/               # i18n dictionaries (en, pl)
└── types/                  # Shared TypeScript types

prisma/
├── schema.prisma           # Data model
├── migrations/             # SQL migrations
└── seed.ts                 # Skills, campaigns, demo users and projects
```

**High-level flow**

1. User registers or logs in, then browses the campaign catalog
2. Leader starts setup (mode, team, roles, stack) and the project becomes `ACTIVE`
3. Quests unlock by dependencies; assign, submit via GitHub URL, review, earn XP
4. Client events trigger from progress; leader resolves them with health and scope effects
5. Leader completes the campaign, generates the final report, and optionally publishes a public slug

## Data model (overview)

Core entities: `User`, `CampaignTemplate`, `Project`, `ProjectMember`, `ProjectQuest`, `QuestSubmission`, `ProjectClientEvent`, `ProjectActivity`, `Achievement`, `UserSkill`, `FinalReport`, `UserFinalReport`.

See [`prisma/schema.prisma`](prisma/schema.prisma) for the full schema.

## Local setup

### Prerequisites

- Node.js 20.9+ (24 recommended, see `.nvmrc`)
- A PostgreSQL database — a free [Supabase](https://supabase.com) project works out of the box, no Docker required

### 1. Install dependencies

```bash
npm install
```

### 2. Create a database (Supabase, no Docker)

1. Create a free project at [supabase.com](https://supabase.com) and save the database password.
2. Open **Connect → ORMs → Prisma** in the project dashboard and copy the two connection strings:
   - **Transaction pooler** (port `6543`) → `DATABASE_URL`
   - **Session pooler** (port `5432`) → `DIRECT_URL`, used only by Prisma Migrate

> Prefer a local database? `docker compose up -d` starts Postgres 16; use the local URLs from `.env.example` for both variables.

### 3. Environment variables

```bash
cp .env.example .env
```

Paste both connection strings into `.env` and set a strong `AUTH_SECRET`:

```bash
openssl rand -base64 48
```

### 4. Database migrate and seed

```bash
npm run prisma:generate
npm run db:deploy
npm run db:seed
```

To wipe the database and start over (also re-runs the seed): `npm run db:reset`.

### 5. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

| Variable        | Required   | Description                                      |
| --------------- | ---------- | ------------------------------------------------ |
| `DATABASE_URL`  | Yes        | Runtime connection (Supabase transaction pooler) |
| `DIRECT_URL`    | Yes        | Migration connection (Supabase session pooler)   |
| `AUTH_SECRET`   | Yes        | Session signing secret (long random string)      |
| `NEXTAUTH_URL`  | Production | Public app URL, e.g. `https://your-domain.com`   |
| `E2E_SKIP_SEED` | No         | Set to `1` to skip Playwright global seed        |

## Demo accounts

Password for all demo users: **`devquestdemo`**

| Email                        | Role                              |
| ---------------------------- | --------------------------------- |
| `demo.leader@devquest.local` | Team leader (active demo project) |
| `demo.member@devquest.local` | Team member                       |
| `demo.solo@devquest.local`   | Solo completed campaign           |

**Seeded demo assets**

- Active team project: `demo-team-active-project`
- Completed public portfolio: `/projects/brightlane-booking`
- One-click demo login on `/login`

## Testing

```bash
npm run lint
npm run format
npm run typecheck
npm test
npm run e2e
npm run build
```

Playwright global setup runs migrations and seed automatically unless `E2E_SKIP_SEED=1`.

## CI

| Workflow | File                        | Steps                                               |
| -------- | --------------------------- | --------------------------------------------------- |
| CI       | `.github/workflows/ci.yml`  | install, format, lint, typecheck, unit tests, build |
| E2E      | `.github/workflows/e2e.yml` | Postgres service, migrate, seed, Playwright         |

## Deployment

1. Provision PostgreSQL and set `DATABASE_URL`
2. Set `AUTH_SECRET` and `NEXTAUTH_URL`
3. Run `npx prisma migrate deploy` and `npm run db:seed` (or seed once in CI/CD)
4. Build with `npm run build`, then start with `npm run start`

Compatible with Vercel, Railway, Docker, or any Node 20+ host.

## MVP limitations

Not implemented in this MVP:

- AI-generated content or code analysis
- Payments or subscriptions
- Real-time chat or WebSockets
- Full GitHub OAuth (URL parsing and metadata only)
- University or instructor admin panel
- Campaign creator UI (campaigns are seeded via Prisma)
- Matchmaking
- Automatic code execution or sandbox

## Roadmap (post-MVP)

- Additional campaign templates
- GitHub OAuth integration
- Instructor or cohort analytics
- Notification delivery (email)
- Campaign authoring UI
- Richer portfolio media uploads

## License

[MIT](LICENSE)
