# Appifylab Social Feed

React + Express implementation of the provided Buddy Script login, registration, and feed task.

## Stack

- React 19 + Vite + HeroUI + Tailwind 4
- React Query for server state
- Zustand for UI state
- Express + Prisma + Zod
- Supabase Postgres and private Storage
- Docker-ready for Dokploy

## Setup

```bash
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Create a private Supabase Storage bucket named `post-images`, then add your Supabase URL and service role key to `.env`.

## Deployment

Build the Docker image in Dokploy from this repository. Configure the environment variables from `.env.example`, point `DATABASE_URL` and `DIRECT_URL` to Supabase Postgres, and set Google OAuth redirect URI to:

```txt
https://your-domain.com/api/auth/google/callback
```

