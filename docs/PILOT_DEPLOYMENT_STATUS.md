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

The private server supports one-time owner setup, persistent username/password sign-in, recovery codes, and optional authenticator MFA. Before owner creation only, the setup token is in `~/.local/share/bip-studio/login-token` (mode 600); creation deletes it. Enrol MFA privately in Security, confirm a code, and save replacement recovery codes. Tailscale remains required. Passkeys are not implemented. UI interaction tests run through JSDOM; no real browser visual review or owner phone enrolment has been performed by the agent.

Live checks: unauthenticated API returned 401; authenticated state and mathematical checking passed; OCR read a synthetic printed `3 x 4 = ?` image. The synthetic source was removed. No family images were used. Full worksheet segmentation, reliable handwriting/diagram interpretation and tutoring from arbitrary scans are not implemented.

## Publishing readiness

The reviewed-JSON export and explicit GitHub PR publisher are implemented. The publisher uses the owner's existing server GitHub session, is allowlisted to this repository and never merges main. A narrower publishing credential is recommended before unattended operation. The public app's content-support PR must be merged before a content-only PR can target main successfully. No real content publish/merge was performed in the live server test.

Vercel is not connected. No paid model API, hosting upgrade or subscription was enabled.

## Validation

79 Node tests and 5 Python Studio tests passed locally. Build and initial Home/Kids/Family server rendering passed. Backend auth/OCR/checking were tested on the real server. Browser/mobile rendering, local quota handling across actual devices, complete publishing and teacher review remain outstanding.

## 19 October follow-up — repository changes, not a deployed release

PR #1 was inspected and remains open/unmerged. The pilot URL returned HTTP 401
without its owner session; live UI, Studio authentication and deployed revision
were not verified. Remote SSH attempts from MSI did not establish a session.
No server configuration or deployment was changed in this follow-up.

Added two lesson collections per grade, grouping the existing 18 paths without
claiming new standards coverage. Journey Bip now respects Pause during Wave,
pauses its CSS overlays, reacts to runtime reduced-motion changes, replays on
feedback changes, returns short reactions to idle, and preloads only metadata.
Small curiosity/wave/halo motions use existing video artwork; these are not
newly rendered articulated animations. Homework filename date recognition now
handles underscores (the prior test depended on the current calendar date).

Publishing defaults to main and now supports the explicit allowlisted
`BIP_PUBLISH_BASE=feat/bip-school-math-correctness` for stacked content review
while PR #1 remains open. Set this only in the private Studio service environment
when testing that flow; it has not been set on the server. A content PR against
that branch still requires review and a rebuilt app preview. Creating a PR is
not publishing to the deployed app. Main still requires the app support first.
The Studio reports the target base and rejects success responses without a PR
URL. This target selection was dry-run tested, not live-published to GitHub.

Validation: 86 Node tests, 13 Python backend tests, production build and Python
syntax compilation passed. Node tests include 100,000 seeded generator cases,
independent arithmetic checks on 180 fixed lesson items, collection membership,
and JSDOM checks for pause, reduced motion, feedback and idle transitions.
A real browser run could not start because no Chromium executable is installed.
These checks do not establish complete K–5 coverage or validate arbitrary prose.

`tools/blender/animate_bip.py` prepares eight editable actions on the original
Bip armature. Python syntax checked only: Blender execution, rig-axis retargeting,
visual QA and rendering remain outstanding. No source rig was found in this
repository or the checked MSI project public folder. The original `.blend` (or
rigged model) is required; MP4s alone cannot supply editable joint animation.
No paid services were added.

## Original Blender source recovered on MSI — 19 October

Located `C:\Users\massi\Downloads\Bip_4K60_Event_Animation_Set.zip`, including
`Bip_Master.blend`, `Bip_Healthy_Animated.blend` and the original rendering code.
The archive is unchanged. Working source and eight editable gesture scenes are
under `C:\dev\bip-animation\source` and `C:\dev\bip-animation\school-gestures-v1`.
This supersedes the earlier missing-source/untested-scaffold status above.

The model has transform-controlled parts, not an armature. The armature
scaffold was replaced with a renderer for the actual controls. Blender 4.5.3 LTS
via an isolated Python 3.11 `bpy` runtime rendered eight silent 480×480 / 24 fps
clips on MSI's RTX 4060 (Cycles/OptiX, 12 samples): idle, wave, think, open-hand
picture invitation, nod, encouragement, celebration and rest. Original mesh and
materials are preserved. Hands remain fixed grippers; independent elbows,
wrists/fingers need additional controls. No paid service was used.

Journey Bip and the arcade companion now reference the new clips. The lesson
player returns brief reactions to idle, with a legacy-clip fallback followed by
a still poster if decoding fails. Pause/reduced-motion behavior remains active
during interactions. The arcade companion clears its delayed effects on exit
and question changes. New clips/poster are included in the PWA precache config.

Validation: 87 Node tests and production build passed, including JSDOM controls
for both companions. Three pure-trajectory tests passed. All eight saved Blender
scenes were read back: foot world matrices stayed constant over all 48 frames,
and control start/end matrices matched exactly. FFmpeg decoded all 384 video
frames without errors; FFprobe checked H.264/yuv420p, cadence, dimensions,
duration and absence of audio. Total video size: 761,555 bytes. Six sampled video
frames per take plus the initial wave/point/celebration render poses were visually
reviewed; this is not exhaustive collision or temporal-quality certification.
See `public/bip/gestures/validation.json` and `pose-checks.json` for measurements.

Live pilot deployment and Studio publishing are unchanged and still unverified
in this follow-up. Do not infer that the owner's installed app has been updated.
