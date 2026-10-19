"""Decode every exported frame and record dimensions, cadence and checksums."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

parser = argparse.ArgumentParser()
parser.add_argument('folder', type=Path)
args = parser.parse_args()
expected = {'idle','wave','think','point','nod','encourage','celebrate','rest'}
paths = sorted(args.folder.glob('*.mp4'))
if {p.stem for p in paths} != expected:
    raise ValueError('Missing or unexpected gesture clips')
results = []
for path in paths:
    info = json.loads(subprocess.check_output(['ffprobe','-v','error','-count_frames',
        '-show_streams','-show_format','-of','json',str(path)], text=True))
    streams = info['streams']
    if len(streams) != 1:
        raise ValueError('Exactly one silent video stream is required')
    s = streams[0]
    assert s['codec_type'] == 'video' and s['codec_name'] == 'h264'
    assert s['width'] == s['height'] == 480
    assert s['r_frame_rate'] == '24/1' and s['nb_read_frames'] == '48'
    assert s['pix_fmt'] == 'yuv420p'
    assert abs(float(info['format']['duration'])-2.) < 1e-6
    subprocess.run(['ffmpeg','-v','error','-xerror','-i',str(path),'-f','null','-'], check=True)
    results.append({'file':path.name,'bytes':path.stat().st_size,
        'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),
        'codec':'h264','pixel_format':'yuv420p','width':480,'height':480,
        'fps':24,'decoded_frames':48,'duration_seconds':2,'audio_streams':0})
report = {'source_file':'Bip_Master.blend',
    'source_sha256':'bc92fe0f9dd81cd8b51409eb6c2fce9d8ad4d2cc78d03e93ca899e1e6e82b504',
    'renderer':'Blender 4.5.3 LTS / Cycles, 12 samples, OptiX',
    'checks':'Full FFmpeg decode, FFprobe frame/dimension/cadence/audio checks; sampled visual review is separate.',
    'clips':results,'total_video_bytes':sum(r['bytes'] for r in results)}
(args.folder/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'clips':len(results),'decoded_frames':len(results)*48,'video_bytes':report['total_video_bytes']}))
