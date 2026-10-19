# Bip Vercel pilot

Release source: `main` in `tinouchemassinissa/learn-with-bip`, after merging PR #1. Confirm the latest main commit includes Kids’ World, Family & Teacher Guide and the Learn with Bip name before importing it into Vercel. Use feature branches for preview builds, not as the long-term production branch.

`vercel.json` selects Vite, installs the lockfile with `npm ci`, runs the JavaScript tests before building, and serves only `dist`. Source/log visibility is disabled in the Vercel project settings (`publicSource: false`). Deployment access is protected separately with Vercel Authentication for all deployments; no `public` field belongs in vercel.json.

## Account setup before first deployment

Use a Hobby account for the personal, non-commercial family trial. Do not activate a Pro trial, paid marketplace services, paid model APIs or upgrades. Confirm the account and plan through the connected Vercel account before creating a project. Confirm eligibility separately before an organized school deployment.

Create a separate Bip pilot project; do not modify the existing USA Map or other apps. Link the repository and select the checked branch. Preserve private pilot access with an available Vercel Authentication protection setting, verifying whether it covers the intended preview/production URL before sharing. Do not treat a difficult-to-guess URL or hidden source logs as access control.

No app runtime secrets, home-server credentials, server tunnel, database or model inference service are required. Content Studio remains on the home server. Private homework files are browser records, not shared lesson assets.

## Verification after deployment

Confirm Vercel reports a successful build and the app's version identifies the intended commit. On a phone and Chromebook, test onboarding, an independent answer, a wrong answer with visual help, lesson resume after reopening, pause/reduced motion and a private backup export/restore. Check that admin Studio routes are not served. Preserve the previous successful deployment for recovery.

Changing from the existing pilot URL to Vercel changes the browser origin. Homework and progress do not automatically move. Export the family backup from the old URL and restore it on the new URL; nickname-only guest records are excluded. Keep the old URL until restoration is checked.

## Scope

This is a pilot, not certification of complete K–5 curriculum coverage or school readiness. A Vercel project and live URL have not been created by adding these configuration files.

Official references checked 19 October 2026:
- https://vercel.com/docs/frameworks/frontend/vite
- https://vercel.com/docs/project-configuration/vercel-json
- https://vercel.com/docs/plans/hobby
