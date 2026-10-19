"""Author gesture takes on an existing Bip rig; never replace the character mesh.
blender source.blend --background --python tools/blender/animate_bip.py -- \
  --rig BipRig --map rig-map.json --output /absolute/path/bip-gestures.blend
Map semantic parts to actual pose bones. No external services or child data.
"""
import argparse
import json
import math
import sys
from pathlib import Path
import bpy


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--rig', required=True)
    parser.add_argument('--map', required=True)
    parser.add_argument('--output', required=True)
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1:])
    output = Path(args.output).resolve()
    if output.suffix != '.blend' or output.exists() or output == Path(bpy.data.filepath).resolve():
        raise ValueError('Choose a new .blend output; existing files are never overwritten')
    rig = bpy.data.objects.get(args.rig)
    if not rig or rig.type != 'ARMATURE':
        raise ValueError('The named Bip armature must exist in the source file')
    mapping = json.loads(Path(args.map).read_text())
    required = {'head', 'upper_arm_left', 'upper_arm_right', 'forearm_right'}
    if set(mapping) != required or any(name not in rig.pose.bones for name in mapping.values()):
        raise ValueError('Map all four semantic parts to existing pose bones')
    if len(set(mapping.values())) != len(mapping):
        raise ValueError('Each semantic part needs a distinct bone')
    if rig.animation_data and (rig.animation_data.action or len(rig.animation_data.nla_tracks)):
        raise ValueError('Use a copy of the source rig with no active animation/NLA tracks')
    if any(rig.pose.bones[name].constraints for name in mapping.values()):
        raise ValueError('Map unconstrained FK controls; IK/constraint rigs require adaptation')
    # Local XYZ degree offsets: retarget axes after viewing your particular rig.
    # Every take starts and ends at the original pose for a calm return to idle.
    gestures = {
        'idle_breathe': [(30, 'head', (1, 0, 0)), (70, 'head', (-1, 0, 0))],
        'hello_wave': [(18, 'upper_arm_right', (0, -15, -65)), (30, 'forearm_right', (0, 0, -25)), (42, 'forearm_right', (0, 0, 20)), (54, 'forearm_right', (0, 0, -25))],
        'thinking_tilt': [(25, 'head', (0, -5, 7)), (65, 'head', (0, 4, -3))],
        'look_at_picture': [(25, 'head', (8, 10, 0)), (65, 'head', (8, 10, 0))],
        'show_picture': [(25, 'upper_arm_right', (-12, -10, -40)), (65, 'upper_arm_right', (-12, -10, -40))],
        'encourage_nod': [(25, 'head', (7, 0, 0)), (45, 'head', (-2, 0, 0)), (60, 'head', (5, 0, 0))],
        'celebrate': [(24, 'upper_arm_left', (0, 0, 45)), (24, 'upper_arm_right', (0, 0, -45)), (50, 'head', (-4, 0, 0))],
        'goodbye': [(25, 'upper_arm_right', (0, -10, -50)), (40, 'forearm_right', (0, 0, -20)), (55, 'forearm_right', (0, 0, 15))],
    }
    original = {part: rig.pose.bones[name].matrix_basis.copy() for part, name in mapping.items()}
    rig.animation_data_create()
    for take, cues in gestures.items():
        for part, name in mapping.items():
            rig.pose.bones[name].matrix_basis = original[part]
        action = bpy.data.actions.new('Bip_' + take)
        action.use_fake_user = True
        rig.animation_data.action = action
        for part, name in mapping.items():
            bone = rig.pose.bones[name]
            bone.rotation_mode = 'XYZ'
            base = bone.rotation_euler.copy()
            frames = {1: (0, 0, 0), 90: (0, 0, 0)}
            frames.update({frame: degrees for frame, target, degrees in cues if target == part})
            for frame, degrees in sorted(frames.items()):
                bone.rotation_euler = tuple(base[i] + math.radians(degrees[i]) for i in range(3))
                bone.keyframe_insert('rotation_euler', frame=frame, group=part)
        rig.animation_data.action = None
    for part, name in mapping.items():
        rig.pose.bones[name].matrix_basis = original[part]
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, 90
    scene.render.fps = 30
    scene.frame_set(1)
    bpy.ops.wm.save_as_mainfile(filepath=str(output))
    print(json.dumps({'output': str(output), 'takes': list(gestures), 'frames': 90, 'fps': 30}))


if __name__ == '__main__':
    main()
