"""Read generated .blend files and verify neutral endpoints and planted feet."""
import argparse
import json
from pathlib import Path
import sys
import bpy

parser = argparse.ArgumentParser()
parser.add_argument('folder', type=Path)
args = parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else None)
report = {}
paths = sorted(args.folder.glob('*.blend'))
if len(paths) != 8:
    raise ValueError('Expect all eight school gesture scenes')
for path in paths:
    bpy.ops.wm.open_mainfile(filepath=str(path))
    scene = bpy.context.scene
    controls = [o for o in bpy.data.objects if o.name.startswith('CTRL_')]
    feet = [o for o in bpy.data.objects if 'boot' in o.name or 'sole' in o.name]
    if len(feet) != 4 or len(controls) != 10:
        raise ValueError('Unexpected original model hierarchy')
    scene.frame_set(1)
    initial = {o.name:o.matrix_world.copy() for o in controls+feet}
    maximum_foot_delta = 0.
    for frame in range(1,49):
        scene.frame_set(frame)
        for obj in feet:
            maximum_foot_delta = max(maximum_foot_delta, max(
                abs(obj.matrix_world[r][c]-initial[obj.name][r][c])
                for r in range(4) for c in range(4)))
    scene.frame_set(48)
    end_delta = max(abs(obj.matrix_world[r][c]-initial[obj.name][r][c])
                    for obj in controls for r in range(4) for c in range(4))
    report[path.stem] = {'frames':scene.frame_end-scene.frame_start+1,
        'fps':scene.render.fps, 'feet_world_matrix_delta':maximum_foot_delta,
        'control_endpoint_matrix_delta':end_delta}
    if maximum_foot_delta >= 1e-6 or end_delta >= 1e-6:
        raise ValueError('Feet or endpoint pose moved unexpectedly: '+path.stem)
print('BIP_POSE_CHECKS:'+json.dumps(report), flush=True)
