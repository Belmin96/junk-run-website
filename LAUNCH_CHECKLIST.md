# Junk Run Website Launch Checklist

## Completed in this website repository
- Role-based customer, contractor and admin dashboard
- Customer job posting form synchronized with server validation
- Customer estimate comparison and acceptance
- Public job search and safe job detail pages
- Public contractor profiles
- Private customer/awarded-contractor messaging
- Admin marketplace job moderation and audit history
- Terms, Privacy, Contractor Agreement, Customer Agreement, Prohibited Items and Refund pages
- Automated build verification
- Automated security-boundary checks
- Facebook QR code

## Launch blockers
1. **App download QR:** replace the homepage placeholder with the final app-download QR/destination before publishing. Do not use a temporary URL.
2. **Stripe:** intentionally excluded from this website implementation. Payment setup, authorization/capture, transfers, refunds and recorded processing fees remain to be completed by the owner.
3. **Staging:** deploy the website with production-like Clerk and database environment variables, then test the complete customer and contractor flows with dedicated test accounts/data.
4. **Legal:** have the final legal text reviewed by qualified counsel before publication.

## Security test plan
- Customer A cannot access Customer B jobs or estimates.
- Contractor A cannot access Contractor B estimates.
- Contractors cannot see competing estimates.
- Unawarded contractors cannot receive exact customer addresses or GPS coordinates.
- Public job pages never expose customer names, exact addresses, GPS coordinates, payment data or estimates.
- Only the customer and awarded contractor can access job messages.
- Admin APIs reject non-admin accounts.
- App-only endpoints return the mobile-app message and do not provide a desktop bypass.
- Completion photos and GPS arrival verification remain mobile-app-only.

## Deployment environment
Required environment variables:
- DATABASE_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY

The website shares the existing Junk Run database schema. Run the appropriate Prisma deployment/migration process for the target database before enabling production traffic.

**Important:** This repository is separate from Belmin96/JunkRunPublic. Website changes must not be applied to the mobile-app repository.
