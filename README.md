# Junk Run Website

Security-first companion website for JunkRunApp.com.

- Separate repository: website changes do not modify JunkRunPublic.
- Clerk authentication protects private pages.
- Effective roles are CUSTOMER, HAULER, or ADMIN; the browser cannot set its effective role.
- Customer data is scoped to the authenticated customer ID.
- Contractor data is scoped to the authenticated contractor profile.
- Public job queries explicitly select safe fields and omit names, exact addresses, GPS, estimates, payments and private messages.
- GPS arrival verification, completion-photo upload and job completion are blocked from website APIs.
- Security headers are applied in middleware.
- Basic rate limiting is included; replace the in-memory limiter with shared Redis/Upstash before horizontal scaling.
- Stripe secrets stay server-side and no secret keys belong in GitHub.
- Do not run Prisma migrations from this repository. The main app repository owns schema changes.

Required environment variables:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
DATABASE_URL (same PostgreSQL database used by the app)

Run: npm install && npx prisma generate && npm run dev
