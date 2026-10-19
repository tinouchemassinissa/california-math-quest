# Family app and private content Studio

## Public learning app

The home has two doors: Kids’ World and Family & Teacher Guide. Kids choose an explorer nickname and grade once per device. Explorer tiles are labels, not authenticated identities. New learning snapshots use a stable local learner ID. The Play door preserves the earlier arcade; the learning paths remain untimed.

The family workspace stores learners, homework photos/PDFs, notes, file dates/status and up to three planned lessons per day in IndexedDB. Supported files are JPG, PNG, WebP and PDF (8 MB per file; 50 MB per collection). Originals are not uploaded. Filename suggestions are explicitly labelled and are not OCR. A linked practice lesson is selected/confirmed by the adult; Bip does not automatically grade the original worksheet.

The guide contains grade-specific teaching strategies, shared-device guidance and local practice snapshots. Export/restore includes learner folders, attachments, notes and plans; lesson-result snapshots in localStorage are not part of that export yet. Backups are unencrypted. Restore validates all records/attachments before one atomic transaction and rejects colliding work/plan IDs instead of replacing existing data. Store the backup privately. Browser clearing, device loss or changing app domains can lose local data; export before migrating. Shared-browser users can open each other's local folders. This is not a school-grade access-control or student-information system.

## Private owner Studio

`admin/studio.py` runs only on 127.0.0.1. It stores drafts, revision history and source images outside the app repository under `BIP_STUDIO_DATA` (default `~/.local/share/bip-studio`). Nothing in this directory is included in the public build or source publishing payload.

Requirements: Python 3, Node.js (or `BIP_NODE_IMAGE` for isolated checking), optional local Tesseract or an existing `BIP_OCR_IMAGE`. OCR only supports clear PNG/JPG printed pages and returns unverified text. A browser helper can propose a single bounded Grade 3 arithmetic draft from that text. It does not segment complete worksheets, interpret diagrams, recognize handwriting reliably or approve anything automatically.

Start manually:

```sh
python3 admin/studio.py
```

Open through an SSH tunnel, or an explicitly configured private HTTPS reverse proxy. A server-generated login token is stored in `~/.local/share/bip-studio/login-token` with mode 600. Read it privately over SSH and paste it into the Studio login. It rotates on server restart. Sessions last 30 minutes, cookies are HttpOnly/SameSite=Strict (Secure on configured HTTPS), writes require CSRF and same-origin checks, and login failures are throttled. No separate MFA/passkey system was added; private Tailscale/SSH access is another prerequisite. Never expose the loopback listener publicly or enable Tailscale Funnel for it.

Optional environment variables:

- `BIP_STUDIO_DATA`: private storage directory.
- `BIP_STUDIO_ORIGIN`: exact private HTTPS origin behind a trusted proxy.
- `BIP_STUDIO_PORT`: loopback port, default 8765.
- `BIP_OCR_IMAGE`: an existing trusted image containing Tesseract; processing uses network-disabled, read-only, resource-limited containers.
- `BIP_PUBLISH_REPO`: dedicated clean checkout for explicit GitHub publishing.

Images are capped at 256 MB in the private source directory, with an explicit source-image deletion control. Deleting source images does not delete draft questions. The database keeps old question revisions. Back up SQLite using its backup API and copy the private sources directory to private backup storage; do not commit these files.

## Publishing

Approve only original anonymous shared practice after comparing the scan, question, choices, explanation and diagram. Runtime checks cover implemented mathematics, not arbitrary prose or pedagogy. Editing an approved item through Save draft removes its approval. Export includes only the approved question-field allowlist.

`admin/publish.mjs` validates approved JSON, permits only the configured Tinouche Math GitHub repository, creates an isolated worktree/branch, merges approved items by ID, runs installation/tests/build, pushes that content-only branch and creates a review PR. It never merges main. The clean publishing checkout needs Node/npm, Git, GitHub CLI and a repository-restricted credential where possible. No credential is sent to a child's browser. Existing broad-scope GitHub logins should be replaced with a narrow publishing identity before unattended use.

```sh
node admin/publish.mjs /private/approved.json /private/publishing-checkout --dry-run
node admin/publish.mjs /private/approved.json /private/publishing-checkout
```

Merge the app-support PR before publishing content against main. Build-time approved-content validation rejects private metadata, duplicate IDs, unsupported math, contact details and external links; it cannot detect every possible personal reference. The owner remains responsible for privacy/source review. Approved shared practice is an explicit extra activity, not silently substituted for family homework.

A Vercel Git integration is not configured by this work. GitHub PR creation is not a Vercel deployment. The current app remains a private Sites pilot; switching providers needs account/free-plan verification and configuration. No paid model API, hosting upgrade or subscription is enabled.

## Validation limits

Node tests exercise local-storage operations with an in-memory IndexedDB implementation, backup integrity/conflicts, schemas, content validation and publisher dry-run. Python tests exercise loopback authentication/host/CSRF/approval/export controls. Initial React views are server-rendered. These do not establish browser persistence, camera-picker behavior, mobile layout, actual OCR accuracy or end-to-end GitHub/Vercel publication. Do a hands-on family pilot before classroom use.
