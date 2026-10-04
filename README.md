# Futminna Lodges

React + Vite + Tailwind CSS v4 + Supabase. Styling lives in each component as Tailwind classes; `src/index.css` only holds the theme tokens and base styles, and shared building blocks (buttons, panels, tags, modal) are in `src/components/ui.jsx`.

## 1. Database (Supabase SQL Editor, in order)
`supabase/schema.sql` → `supabase/v2-migration.sql` → `supabase/v3-migration.sql`

## 2. Run it
1. `npm install`
2. Copy `.env.example` to `.env` and add your Supabase URL and anon key
3. `npm run dev`

## 3. Sign-in (Supabase dashboard > Authentication)
- Email provider on; "Confirm email" on.
- Edit the "Confirm signup" and "Magic Link" templates to include `{{ .Token }}` so people get a 6-digit code.
- URL Configuration: Site URL = your live site; add `http://localhost:5173/**` and your live domain `/**` to Redirect URLs.
- Authentication > SMTP Settings: set up custom SMTP before launch (Supabase's built-in sender allows only a few emails per hour).
  These emails are only the sign-up / password codes.

`vercel.json` makes direct links like `/lodge/...` and `/connect/...` work after a refresh on Vercel.

This project is the public site only. Lodges, agents, stat categories and bookings are managed from the separate admin project, which uses the same Supabase database.
