# Family app and private content Studio

## Public learning app

The home has two doors: Kids’ World and Family & Teacher Guide. Kids choose an explorer nickname and grade once per device. Explorer tiles are labels, not authenticated identities. New learning snapshots use a stable local learner ID. The Play door preserves the earlier arcade; the learning paths remain untimed.

The family workspace stores learners, homework photos/PDFs, notes, file dates/status and up to three planned lessons per day in IndexedDB. Supported files are JPG, PNG, WebP and PDF (25 MB per file; 250 MB per browser collection). Originals are not uploaded. Filename suggestions are explicitly labelled and are not OCR. A linked practice lesson is selected/confirmed by the adult; Bip does not automatically grade the original worksheet.

The guide contains grade-specific teaching strategies, shared-device guidance and local practice snapshots. Export/restore includes learner folders, attachments, notes and plans; saved lesson results and unfinished lessons for registered learner folders are included; nickname-only guest sessions are excluded. Exported files are unencrypted by default; optional passphrase protection uses AES-256-GCM with PBKDF2-SHA256 (310,000 iterations). A lost passphrase cannot be recovered. Browser folders themselves remain unlocked. Restore validates all records/attachments before one atomic transaction and rejects colliding work/plan IDs instead of replacing existing data. Store the backup privately. Browser clearing, device loss or changing app domains can lose local data; export before migrating. Shared-browser users can open each other's local folders. This is not a school-grade access-control or student-information system.

## Private owner Studio

`admin/studio.py` runs only on 127.0.0.1. It stores drafts, revision history and source images outside the app repository under `BIP_STUDIO_DATA` (default `~/.local/share/bip-studio`). Nothing in this directory is included in the public build or source publishing payload.

Requirements: Python 3, Node.js (or `BIP_NODE_IMAGE` for isolated checking), optional local Tesseract or an existing `BIP_OCR_IMAGE`. OCR only supports clear PNG/JPG printed pages and returns unverified text. A browser helper can propose a single bounded Grade 3 arithmetic draft from that text. It does not segment complete worksheets, interpret diagrams, recognize handwriting reliably or approve anything automatically.

Start manually:

```sh
python3 admin/studio.py
```

Open through an SSH tunnel or the configured private Tailscale HTTPS URL. Use the one-time setup token only to create the owner account, then sign in with username/password and authenticator MFA when enrolled. Sessions last 30 minutes, cookies are HttpOnly/SameSite=Strict (Secure on configured HTTPS), writes require CSRF and same-origin checks, and authentication failures are throttled. Never expose the loopback listener publicly or enable Tailscale Funnel for it. See the owner sign-in section below for recovery and MFA setup.

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


## Owner sign-in and authenticator MFA

The private Studio now has persistent single-owner credentials. Before the owner exists, a server-only setup token creates that account once. After creation, the token is deleted and cannot sign in. Public registration is closed. Passwords use salted scrypt hashes. Sessions expire in 30 minutes and are revoked on password recovery, password change, MFA changes or a service restart.

In **Security**, confirm your password, scan the locally generated QR in a TOTP authenticator (or enter the private setup key), then verify a six-digit code. MFA activates only after successful verification. Save the replacement recovery codes privately: enabling or disabling MFA replaces older codes. No SMS provider, subscription or external QR service is used. Passkeys are not implemented.

Login with MFA requires password plus a fresh code. Codes use a 30-second period, a one-step clock allowance and persistent replay rejection. Failed authentication attempts are throttled. Password changes require a current code while MFA is on. To disable MFA, supply the password and a fresh code.

**Lost phone:** Forgot password accepts a recovery code and a new password. Recovery revokes sessions, replaces all recovery codes, and disables the lost authenticator. Enrol the replacement phone. Recovery codes are password-equivalent secrets, not public reference numbers. No email recovery endpoint is configured.

The TOTP seed must remain retrievable for code verification. It is stored in the private SQLite database under the service's restricted filesystem permissions, not in a separate encrypted vault. Server administrators and anyone with access to a database backup can obtain it. Backups must remain private.

## Guided editor

Choose a grade, then a learning goal filtered to the registered standards for that grade. Four separate choices feed an explicit correct-answer selector. Changing any content invalidates the prior UI check and review checkbox. Automated validation and a human review are required before local approval; the server independently validates approvals. A live student preview and next-step checklist assist review. Drafts support search and approval filters. A new-question action creates a fresh ID so separate questions do not overwrite the initial sample.

The grade-specific standard choices are generated from the app registry; a test prevents drift. This remains partial K–5 coverage, not an endorsement or complete curriculum. Printed OCR proposes only one bounded Grade 3 arithmetic draft.

## Portable homework and device storage

Select files on the homework shelf, then Prepare → Save to device or Share copy. Shared packages exclude learner names, progress, completion status and original filenames; notes are opt-in. Titles and embedded worksheet content are preserved and can still contain personal information: review them yourself. Imports show a summary before confirmation, require a destination of the same grade, and create fresh work IDs. Repeating an import creates extra copies, not synchronization.

Save uses the browser file picker when available; other browsers download the file. Native file sharing is used only when supported, otherwise download and attach the file yourself. Full library backups retain names and progress. Original attachments can also be downloaded individually. No automatic folder access or device synchronization is added.

The storage meter shows attachment bytes against the app's 250 MB cap. Browser available-space estimates are approximate and may be unavailable. A persistence request is optional and may be denied; neither it nor installing the app guarantees backup. Photo optimization is optional, caps the longest edge at 2400 pixels and creates a JPEG copy; inspect the preview for readability. It never edits the source in your photo library.

Packages are JSON with base64 attachments and require memory to assemble/read; passphrase protection adds further overhead. Large libraries may be slow or fail on low-memory phones. Prefer selected smaller transfers rather than filling the limit. Package input is capped at 480 MB including encoding/encryption overhead. Real-phone picker, sharing, image readability and large-library performance still require a physical-device pilot.

## Child/adult navigation

Child arcade setup, play headers, lesson pages and badges do not expose AI Vault/import controls, standards analytics, study-group administration or saved-record deletion. The old public Vault modal is not imported or rendered by the application; private Studio remains the owner content workflow. Family & Teacher Guide holds study groups/Excel, curriculum map, arcade settings, release information and explicit per-lesson saved-practice deletion. Removing practice never removes homework files. This navigation separation is not account authentication or a parental lock; local folders remain accessible to people using the same browser.
