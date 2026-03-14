# Solopad

**The all-in-one workspace for solo freelancers.**

Manage clients, projects, proposals, contracts, invoices, tasks, and time tracking — all in one place. Share a client portal with a single link.

🌐 [solopad.io](https://solopad.io)

---

## Features

- **Client Portal** — Share a one-link portal with clients for files, comments, and invoices
- **Projects** — Track projects with deadlines, status, and file uploads
- **Proposals & Contracts** — Create, send, and manage proposals and contracts
- **Invoices** — Build and send invoices with Stripe payment support
- **Tasks** — Manage tasks with priorities, subtasks, and due dates
- **Contacts** — CRM for leads and clients
- **Time Tracker** — Log time entries per project
- **Scheduler** — Booking page with availability rules
- **Finance** — Track expenses, recurring costs, and revenue
- **Templates** — Reusable proposal and contract templates
- **Multi-tenancy** — Business accounts with team members

---

## Tech Stack

- **Framework** — Next.js 16 (App Router)
- **Styling** — Tailwind CSS v4
- **Database** — PostgreSQL via Prisma
- **Auth** — NextAuth.js v4 (credentials)
- **Payments** — Stripe Checkout
- **Email** — Resend
- **File Storage** — Local filesystem (dev) / S3/R2 (prod)

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
touch .env.local
```

Fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
RESEND_API_KEY="re_..."
```

### 3. Set up the database

```bash
npx prisma db push
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Database

```bash
npx prisma studio          # Browse database
npx prisma db push         # Apply schema changes
npx prisma migrate dev     # Create a migration
```

For local development, use a PostgreSQL database that matches the active Prisma datasource in
[prisma/schema.prisma](/Users/ayaturrehman/Documents/syslom/Project/freelancer/freelance-managment-app/prisma/schema.prisma).
Neon, Supabase, Railway, or a local Postgres instance all work.

---

## Deployment

Deploy to [Vercel](https://vercel.com) with a PostgreSQL database (Supabase, Neon, or Railway recommended).

Set all environment variables in the Vercel dashboard and update `DATABASE_URL` to your production Postgres connection string.
