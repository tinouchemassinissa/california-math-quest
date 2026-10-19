# Bip articulated gestures v2 — 19 October 2026

The original `Bip_Master.blend` was used without rewriting it. Source SHA-256 remains `bc92fe0f9dd81cd8b51409eb6c2fce9d8ad4d2cc78d03e93ca899e1e6e82b504`.

Editable scenes and rendered output on MSI:
`C:\dev\bip-animation\school-gestures-v2-optix-20261019`.
Script copy: `C:\dev\bip-animation\render_school_gestures_v2_20261019.py`.
The earlier unfinished batch directory is not a release source.

## Changes

- Added elbow and wrist transform pivots, with neutral mesh world matrices preserved exactly in a sampled wave scene.
- Added bounded iris/pupil gaze offsets and brief eased blinks.
- Six-second idle, seven 3.2-second reactions; 720×720, 30 fps, silent H.264/yuv420p. These are not 4K clips.
- Dense smooth trajectories with linear keys avoid spline overshoot. No root jumping or flashing color changes.
- A two-layer 220 ms crossfade retains the previous frame until the requested clip loads. Stale load events are ignored, duplicate errors are handled once and only the active layer plays.
- Pause/reduced motion remain available; hidden pages pause media. Arcade framing now contains the full square character.

## Evidence

`public/bip/gestures-v2/validation.json` records the measured stream properties, sizes, transfer SHA-256 matches and full FFmpeg decoding of all 852 frames. The eight files total 2,540,181 bytes.

All eight saved scenes were reopened and every frame checked for leg/boot/foot world-matrix drift: zero observed. All object start/end matrices matched exactly. This checks planted feet and loop endpoints, not all mesh collisions.

Forty-eight decoded frames (six per clip: endpoints, quarter, middle, blink region and late gesture) were visually inspected for framing, attached limbs and gross artifacts. This is a sampled pose review, not a physical-device or exhaustive temporal-quality certification.

The rendering machine used Blender 4.5.3, RTX 4060, Cycles/OptiX and 24 samples with denoising. A sampled comparison of the same wave still with OIDN versus OptiX denoising gave an RGB mean absolute difference of about 0.326 on a 0–255 scale. This narrow check supported switching denoisers to reduce rendering time; it is not a general image-quality benchmark.

Synthetic React/JSDOM tests cover pause, rapid clip replacement, stale loads, duplicate failures, completion, fallback, hiding the page and returning while paused. Seven pure trajectory tests cover both profiles. Browser touch layout, real autoplay policy and phone frame pacing still require hands-on testing.

Original v1 files remain available for recovery. New files use a separate `gestures-v2` path. No new conversational model or inference runtime is installed in the app.
