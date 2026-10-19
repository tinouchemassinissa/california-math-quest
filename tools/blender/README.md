# Bip school gestures — original editable model

The original source was located on MSI in:
`C:\Users\massi\Downloads\Bip_4K60_Event_Animation_Set.zip`.
It contains `Bip_Master.blend`, `Bip_Healthy_Animated.blend`, and the original
build/refinement/rendering scripts. The archive is preserved. Working source:
`C:\dev\bip-animation\source\Bip_Master.blend`.

Source SHA-256:
`bc92fe0f9dd81cd8b51409eb6c2fce9d8ad4d2cc78d03e93ca899e1e6e82b504`.

This model uses transform-controlled objects, **not an armature**. The earlier
armature scaffold was replaced with `render_school_gestures.py`, which uses the
actual `CTRL_head`, `CTRL_body`, `CTRL_arm_-1/1`, `CTRL_eye_-1/1` and antenna
controls. It preserves the mesh/materials, keeps the feet planted, hides the
maintenance wrench and uses gentle shoulder, head, antenna and eye movements.
The hands are fixed grippers; independent elbow, wrist or finger articulation
would require extending the original controls and hierarchy.

The eight two-second takes are idle, wave, think, point (open-hand invitation),
nod, encourage, celebrate and rest. All takes share a neutral first/last pose.
Movements use eased entry/exit and secondary motion. No audio, flashing status
colors, root jumping or red alarm animation is used. Do not interpret gestures
as counting or evidence of understanding a child's work.

On MSI, an isolated Blender 4.5.3 `bpy` runtime is available at
`C:\dev\bip-animation\blender-runtime\Scripts\python.exe`. It uses the RTX 4060
via Cycles/OptiX. No paid services or app runtime dependencies are needed.

Example (adjust paths on another computer):

```powershell
& C:\dev\bip-animation\blender-runtime\Scripts\python.exe render_school_gestures.py `
  --source C:\dev\bip-animation\source\Bip_Master.blend `
  --output C:\dev\bip-animation\school-gestures-next
```

A new output directory is required, protecting earlier renders. `--stills`
renders midpoint review poses. Full mode saves an editable `.blend` and silent
H.264 MP4 for each take at 480×480, 24 fps, 48 frames. The app uses only the small
MP4s and a first-frame WebP poster in `public/bip/gestures/`. Original 4K videos
remain for legacy use/fallback. New gestures are included in PWA precaching.

Journey playback runs a brief reaction once, then returns to idle. Pause and
reduced motion remain effective during Wave. A missing clip falls back to an
existing local clip, then a still poster. The older arcade companion also uses
the new clips, and action buttons no longer force playback to resume.

Verification details and remaining limits are recorded in
`docs/PILOT_DEPLOYMENT_STATUS.md` and `public/bip/gestures/validation.json`.

## Articulated v2 profile

`render_school_gestures_v2.py` extends the transform hierarchy with elbow and wrist pivots in a new copy of the scene. It preserves the neutral mesh transforms and the original `.blend`. Gripper fingers remain rigid; no humanoid armature or finger-count teaching is implied.

The profile is square 720×720 at 30 fps: a six-second idle and seven 3.2-second reactions. Subtle iris/pupil offsets produce gaze changes without moving the entire eye lens. Blinks are kept brief even in the longer idle. GPU rendering uses OptiX denoising when available, with CPU fallback.

The app keeps the old frame visible until the next clip loads, then crossfades over 220 ms. Rapid requests discard stale loads. Only the active clip plays. Pause, reduced motion and hidden-tab handling remain supported; no animation audio is added. Both arcade and learning-path stages fit the entire square character rather than crop it into a widescreen box.

Run the full media validation after rendering:

```bash
python3 tools/blender/validate_gestures.py public/bip/gestures-v2 --output public/bip/gestures-v2/validation.json
```

It checks each stream, codec, dimensions, frame count, rate, duration and audio absence, then decodes every frame and records SHA-256 digests. Visual review and physical-device performance are separate from these checks.
