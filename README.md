# Junk Run Website

Website companion for **JunkRunApp.com**.

## Non-negotiable boundaries
- Separate repository from `JunkRunPublic`.
- Do not modify the existing Junk Run app repository.
- Public jobs never expose names, exact addresses, GPS coordinates, estimates, payment information or private messages.
- Job completion, completion-photo upload and GPS arrival verification remain mobile-app-only.
- Customer cancellation can be available on the website.
- Customers can review contractors; reviews are not public.
- Contractor dashboard shows earnings/activity but excludes Junk Run fees, manually entered expenses and profit-after-expenses calculations.

## Current implementation
This commit establishes the production-oriented Next.js website shell, responsive branded UI, public jobs view, contractor dashboard, API health endpoint, and a clear integration boundary.

### Environment
Set `JUNKRUN_API_BASE_URL` to the existing app backend when the backend's supported website/API routes are confirmed. Clerk keys should be supplied only through Replit/Vercel environment secrets, never committed.

## Run
`npm install`
`npm run dev`

## Before production
Connect the authenticated Clerk session to the existing Junk Run backend, map the exact existing API/database contracts, add Stripe using server-side secrets, replace demo values, add the supplied final app QR code and exact logo asset, and run authorization/privacy/security tests.
