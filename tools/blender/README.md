# Bip gesture authoring

The repository contains rendered Bip MP4s, not an editable `.blend`, mesh, or rig.
`animate_bip.py` is an authoring scaffold for the original model. It has not been
run in Blender or visually validated. It does not generate new animation videos
by transforming the existing MP4, and the app does not load these takes yet.

Use a copy of the original Blender file with an unconstrained FK armature and no
active animation or NLA tracks. Supply `--rig` and `--map` as documented in the
script. The mapping JSON must map `head`, `upper_arm_left`, `upper_arm_right`,
and `forearm_right` to four different existing pose bones. Choose a new output
`.blend` path; the source and existing outputs are protected against overwrite.

The script authors eight separate three-second takes, preserves the mesh and
materials, and returns each take to its initial pose. Local rotation axes need
retargeting to the actual rig. Preview each action with the original camera,
check joint limits, hand/head intersections and planted feet, and adjust the
curves before rendering. Pose control names cannot be inferred from the MP4s.

For web delivery, render silent H.264 MP4 at 480–720p / 30 fps with a first-frame
poster, then inspect seams and a mobile-sized preview. Keep each clip short;
never autoplay audio. Add only reviewed renders to `public/bip/gestures/`, then
map them in `bipLessonReaction.js`. Preserve reduced-motion, pause, and fallback
behavior. Do not label a backup animation as an actual pointing gesture.
