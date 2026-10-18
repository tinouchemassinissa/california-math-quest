# Free school pilot deployment

## Baseline

This React/Vite PWA can be served as static files. Core games, answer checking, hints and local records run in the browser; no home server, student cloud account, model API, subscription or paid function is required. Downloaded lesson/video assets have separate browser cache behavior; do not promise that every Bip video works offline. Browser read-aloud may use voices supplied by the device and is not a guarantee of offline or entirely local speech.

Use nicknames on shared devices. Browser storage can be accessed by other users of that browser, cleared by school policy or lost with a device. Current local learning records are not authenticated private student accounts, and the overall learner profile is not yet a separately protected per-child multi-device record. Classroom session logs support named attempts/exports, but those exports and the shared aggregate learning profile need teacher oversight. Do not activate a centralized student-data service without agreeing its data handling with the school.

## Hosting choices

Cloudflare Pages static hosting is the proposed baseline. Vercel supports the build technically, but its Hobby plan describes personal, non-commercial use; confirm eligibility for the intended school arrangement before selecting it. Do not enable Pro trials, paid functions, Workers AI, external paid AI APIs or automatic upgrades.

Both providers accept:

- Build command: `npm run build`
- Output directory: `dist`
- Tests before publication: `npm ci`, `npm test`, `npm run build`

Use a preview branch first. No hosting project has been created or deployed by this batch. Plans and limits must be rechecked at deployment time.

References checked 18 October 2026:
https://vercel.com/docs/plans/hobby
https://vercel.com/docs/limits/fair-use-guidelines
https://developers.cloudflare.com/pages/functions/pricing/
https://developers.cloudflare.com/pages/platform/limits/

## Bip model roadmap

The shipped baseline uses reviewed conceptual first hints, the built-in generator/checker and optional worked solutions. Existing MP4 animation is preserved. Generative conversation and a rigged 3D avatar are future enhancements, not implemented features.

Benchmark any candidate Gemma or other local model against the same fixed test set: arithmetic traps, misleading student claims, short age-appropriate explanations, curriculum scope, refusal/recovery, latency and memory. It must not alter answer keys, independently grade students or silently import generated lessons. If AI is unavailable, the reviewed teaching path remains usable. Your home server is suitable for a controlled family experiment, not an assumed classroom-wide inference service.
