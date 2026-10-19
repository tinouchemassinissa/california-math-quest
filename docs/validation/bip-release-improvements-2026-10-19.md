# Bip release improvements — 2026-10-19

Changes: visible app build provenance, authenticated Studio revision, checked unfinished-lesson replay, family-folder learning backup/restore, topic-specific visual cues, targeted misconception feedback and 36 additional fixed review items (216 total across 18 bounded mini-lessons). Two review pairs alternate; this is not unlimited fresh content or complete curriculum coverage.

Resume reconstructs each saved answer through the checked journey transitions. It rejects malformed, mismatched and inconsistent stored attempts. These are local convenience records, not tamper-proof assessments. Assistance remains recorded. A child leaving the worked-example strategy stage may repeat that strategy choice when returning.

Backups preflight all imported learning records, reject existing keys and remove newly written learning records if the homework transaction fails. IndexedDB and localStorage are separate browser stores; this is not crash-atomic across the two stores. Restore into a fresh browser and retain the backup. Guest sessions are excluded.

UI automation uses synthetic data in JSDOM, including an incorrect multiplication response, the actual equal-group picture and leaving/reopening a lesson. It does not assess rendering, touch behavior, video smoothness or physical phone storage eviction. Tests also check all fixed items against independent arithmetic and every lesson's resumed transitions.

The existing silent 480×480 gesture clips are retained. New Blender rig controls, longer clips, gaze, wrist/elbow articulation and natural transitions have not been rendered by this change. No new conversational model, child identity recognition or automatic publication of private homework is added.
