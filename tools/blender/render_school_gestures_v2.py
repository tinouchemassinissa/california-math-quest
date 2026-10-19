"""Render teaching gestures from the original transform-controlled Bip scene.
Run with Blender Python (bpy 4.5.3), or blender --background --python ... -- ...
Writes only to a new output directory, preserving the source .blend.
"""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys
import bpy

TAKES = ('idle', 'wave', 'think', 'point', 'nod', 'encourage', 'celebrate', 'rest')
FRAMES = 96
FPS = 30


def ease(t):
    t = max(0., min(1., t))
    return t*t*t*(10+t*(-15+6*t))


def envelope(t):
    return ease(t/.25) * ease((1-t)/.25)


def pose(take, t):
    """Small secondary motion and eased anticipation; planted feet, no root jump."""
    e = envelope(t)
    sway = math.sin(2*math.pi*t)
    # Same neutral endpoints across all takes; only idle is looped in the app.
    p = {'head': [0., -.10, 0.], 'left': [0., 0., 0.], 'right': [0., 0., 0.],
         'elbow': [0., 0.], 'wrist': [0., 0.], 'gaze': [0., 0.],
         'body': [0., 0., 0.], 'antenna': [.012*e*sway, 0., .012*e*sway], 'eyes': 1.}
    p['head'][0] += .012*e*sway
    p['gaze'] = [.018*e*math.sin(2*math.pi*t), .008*e*math.sin(4*math.pi*t)]
    p['elbow'] = [.035*e, .035*e]
    p['body'][1] = .006*e*sway
    if take == 'wave':
        p['right'] = [-.12*e, e*(-1.65+.08*math.sin(4*math.pi*t)), .06*e]
        p['head'][2] = -.055*e
        p['elbow'][1] = .20*e
        p['wrist'][1] = .25*e*math.sin(6*math.pi*t)
    elif take == 'think':
        p['head'][1] += .10*e
        p['head'][2] = .07*e
        p['left'] = [-.12*e, .18*e, 0.]
        p['elbow'][0] = .18*e
    elif take == 'point':
        # Open gripper / arm invitation, not a mathematically specific finger count.
        p['right'] = [-.15*e, -1.05*e, .06*e]
        p['head'][2] = .10*e
        p['elbow'][1] = .16*e
        p['wrist'][1] = -.10*e
        p['gaze'] = [.025*e, -.012*e]
    elif take == 'nod':
        p['head'][0] += .12*e*math.sin(4*math.pi*t)
    elif take == 'encourage':
        p['head'][2] = -.05*e
        p['head'][0] += .07*e*math.sin(2*math.pi*t)
        p['right'] = [-.18*e, -.48*e, 0.]
    elif take == 'celebrate':
        p['left'] = [0., 1.0*e, -.04*e]
        p['right'] = [0., -1.0*e, .04*e]
        p['head'][0] -= .045*e
    elif take == 'rest':
        p['head'][0] += .11*e
        p['eyes'] = 1.-.90*e
    # An eased, short screen-eye blink. No flashing light/color changes.
    if take != 'rest':
        blink_width = .025 if take == 'idle' else .047
        blink = max(0., 1.-abs(t-.67)/blink_width)
        p['eyes'] = 1.-.92*ease(blink)
    return p


def prepare(source, take, size):
    bpy.ops.wm.open_mainfile(filepath=str(source))
    controls = {k: bpy.data.objects.get(v) for k, v in {
        'root':'CTRL_Bip', 'head':'CTRL_head', 'body':'CTRL_body',
        'left':'CTRL_arm_-1', 'right':'CTRL_arm_1',
        'eye_l':'CTRL_eye_-1', 'eye_r':'CTRL_eye_1',
        'ant_l':'CTRL_antenna_-1', 'ant_r':'CTRL_antenna_1'}.items()}
    if any(v is None or v.type != 'EMPTY' for v in controls.values()):
        raise ValueError('Original Bip transform controls are missing')
    for obj in bpy.data.objects:
        obj.animation_data_clear()
    for mat in bpy.data.materials:
        if mat.node_tree:
            mat.node_tree.animation_data_clear()
    # Remove the server-maintenance wrench from learning gestures.
    tool = bpy.data.objects.get('CTRL_tool')
    if tool:
        for obj in [tool, *tool.children_recursive]:
            obj.hide_render = True
    # Add local pivot controls without moving the original mesh in neutral pose.
    def pivot(name, parent, location):
        from mathutils import Matrix
        obj=bpy.data.objects.new(name,None);bpy.context.collection.objects.link(obj)
        obj.parent=parent;obj.matrix_world=Matrix.Translation(location)
        bpy.context.view_layer.update()
        return obj
    def attach(obj,parent):
        world=obj.matrix_world.copy();obj.parent=parent;obj.matrix_world=world
        bpy.context.view_layer.update()
    for side,suffix,fingers in [('-1','',['Rounded gripper finger','Rounded gripper finger.001']),('1','.001',['Rounded gripper finger.002','Rounded gripper finger.003'])]:
        arm=controls['left' if side=='-1' else 'right']
        elbow=pivot('CTRL_elbow_'+side,arm,bpy.data.objects['Elbow'+suffix].matrix_world.translation.copy())
        hand=bpy.data.objects['Mitten gripper'+suffix]
        wrist_pos=hand.matrix_world.translation.copy();wrist_pos.z+=.08
        wrist=pivot('CTRL_wrist_'+side,elbow,wrist_pos)
        attach(bpy.data.objects['Ivory forearm'+suffix],elbow)
        for name in ['Mitten gripper'+suffix,*fingers]:attach(bpy.data.objects[name],wrist)
        controls['elbow_'+side]=elbow;controls['wrist_'+side]=wrist
    gaze_parts=[bpy.data.objects[n] for n in ['Amber iris','Amber iris.001','Eye pupil','Eye pupil.001']]
    gaze_origins={obj.name:obj.location.copy() for obj in gaze_parts}
    for frame in range(1, FRAMES+1):
        p = pose(take, (frame-1)/(FRAMES-1))
        for key in ('head', 'body', 'left', 'right'):
            obj = controls[key]; obj.rotation_mode = 'XYZ'; obj.rotation_euler = p[key]
            obj.keyframe_insert(data_path='rotation_euler', frame=frame)
        for key in ('ant_l', 'ant_r'):
            obj = controls[key]; obj.rotation_euler = p['antenna']
            obj.keyframe_insert(data_path='rotation_euler', frame=frame)
        for key in ('eye_l', 'eye_r'):
            obj = controls[key]; obj.scale = (1., 1., p['eyes'])
            obj.keyframe_insert(data_path='scale', frame=frame)
        for index,side in enumerate(['-1','1']):
            for part in ['elbow','wrist']:
                obj=controls[part+'_'+side];obj.rotation_mode='XYZ'
                obj.rotation_euler=(p[part][index],0.,0.) if part=='elbow' else (0.,p[part][index],0.)
                obj.keyframe_insert(data_path='rotation_euler',frame=frame)
        for obj in gaze_parts:
            obj.location=gaze_origins[obj.name]
            obj.location.x+=p['gaze'][0];obj.location.z+=p['gaze'][1]
            obj.keyframe_insert(data_path='location',frame=frame)
    # Linear keys follow the densely sampled smooth curves without spline overshoot.
    for obj in bpy.data.objects:
        if obj.animation_data and obj.animation_data.action:
            action=obj.animation_data.action
            for layer in action.layers:
                for strip in layer.strips:
                    for slot in action.slots:
                        bag=strip.channelbag(slot)
                        if bag:
                            for curve in bag.fcurves:
                                for key in curve.keyframe_points:key.interpolation='LINEAR'
    scene = bpy.context.scene
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.threads_mode = 'FIXED'; scene.render.threads = 8
    prefs = bpy.context.preferences.addons['cycles'].preferences
    try:
        prefs.compute_device_type = 'OPTIX'; prefs.get_devices()
        gpu = False
        for device in prefs.devices:
            device.use = device.type == 'OPTIX'; gpu |= device.use
        scene.cycles.device = 'GPU' if gpu else 'CPU'
    except Exception:
        scene.cycles.device = 'CPU'
    scene.cycles.denoiser = 'OPTIX' if scene.cycles.device == 'GPU' else 'OPENIMAGEDENOISE'
    scene.render.resolution_x = scene.render.resolution_y = size
    scene.render.resolution_percentage = 100
    scene.render.fps = FPS
    scene.frame_start, scene.frame_end = 1, FRAMES
    scene.camera.data.ortho_scale = 3.9
    scene.frame_set(1)
    return scene


def main():
    global FRAMES
    parser = argparse.ArgumentParser()
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--takes', nargs='+', choices=TAKES, default=list(TAKES))
    parser.add_argument('--stills', action='store_true')
    parser.add_argument('--size', type=int, default=720)
    args = parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else None)
    source, output = args.source.resolve(), args.output.resolve()
    if not source.is_file() or source.suffix != '.blend':
        raise ValueError('Provide the original Bip .blend source')
    if output.exists() or args.size < 240 or args.size > 1080:
        raise ValueError('Choose a new output directory and size 240–1080')
    output.mkdir(parents=True)
    report = {'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),
              'blender':bpy.app.version_string, 'fps':FPS, 'frames':FRAMES,
              'size':args.size, 'takes':[]}
    for take in args.takes:
        FRAMES=180 if take=='idle' else 96
        scene = prepare(source, take, args.size)
        if args.stills:
            scene.frame_set(FRAMES//2)
            scene.render.image_settings.file_format = 'PNG'
            scene.render.filepath = str(output/(take+'.png'))
            bpy.ops.render.render(write_still=True)
        else:
            bpy.ops.wm.save_as_mainfile(filepath=str(output/(take+'.blend')))
            scene.render.image_settings.file_format = 'FFMPEG'
            scene.render.ffmpeg.format = 'MPEG4'; scene.render.ffmpeg.codec = 'H264'
            scene.render.ffmpeg.constant_rate_factor = 'HIGH'
            scene.render.ffmpeg.ffmpeg_preset = 'GOOD'
            scene.render.ffmpeg.gopsize = FPS
            scene.render.filepath = str(output/(take+'.mp4'))
            bpy.ops.render.render(animation=True)
        report['takes'].append({'name':take,'frames':FRAMES})
        (output/'render-report.json').write_text(json.dumps(report, indent=2))
        print('BIP_DONE', take, flush=True)


if __name__ == '__main__':
    main()
