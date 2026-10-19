# Pilot deployment — 18 October 2026 (Los Angeles)

## Family app

Private pilot: https://bip-math-pilot.tinouchem.chatgpt.site

The home now has Kids’ World and Family & Teacher Guide. Explorer onboarding, 18 lessons, local homework files/notes/status, short practice plans, adult strategies, local snapshots and collection backup/restore are available. Browser persistence and touch/camera behavior still require hands-on testing. This is an owner-private Sites pilot, not a public school deployment or a Vercel app yet.

## Private owner Studio

Tailnet-only URL: https://tinouche-server.tailbe09b4.ts.net:8465/

- Checkout: `/home/tinouchem/cloud-stack/bip-content-studio`
- Dedicated publishing checkout: `/home/tinouchem/cloud-stack/bip-content-publish`
- Private database/source data: `/home/tinouchem/.local/share/bip-studio`
- Service: `systemctl --user status bip-content-studio.service`
- Listener: `127.0.0.1:8765`; Tailscale Serve on HTTPS 8465, not Funnel.
- User lingering enabled so the service can start without an interactive login.
- Runtime: separate user-local Node v22.23.3, downloaded over HTTPS and matched against the official SHA256 list.
- OCR: existing Paperless Tesseract 5.5.0 image; network disabled, read-only, bounded CPU/memory.

The server login token is in `~/.local/share/bip-studio/login-token` (mode 600). Read it privately through SSH and paste it into the Studio form. Do not share it in chat. It rotates when the service restarts. It is not a passkey/MFA implementation; Tailscale/SSH plus the Studio token are the current access prerequisites.

Live checks: unauthenticated API returned 401; authenticated state and mathematical checking passed; OCR read a synthetic printed `3 x 4 = ?` image. The synthetic source was removed. No family images were used. Full worksheet segmentation, reliable handwriting/diagram interpretation and tutoring from arbitrary scans are not implemented.

## Publishing readiness

The reviewed-JSON export and explicit GitHub PR publisher are implemented. The publisher uses the owner's existing server GitHub session, is allowlisted to this repository and never merges main. A narrower publishing credential is recommended before unattended operation. The public app's content-support PR must be merged before a content-only PR can target main successfully. No real content publish/merge was performed in the live server test.

Vercel is not connected. No paid model API, hosting upgrade or subscription was enabled.

## Validation

79 Node tests and 5 Python Studio tests passed locally. Build and initial Home/Kids/Family server rendering passed. Backend auth/OCR/checking were tested on the real server. Browser/mobile rendering, local quota handling across actual devices, complete publishing and teacher review remain outstanding.
