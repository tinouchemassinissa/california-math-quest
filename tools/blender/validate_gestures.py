"""Decode and measure the eight v2 gesture files; requires FFmpeg/FFprobe."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess

TAKES=('idle','wave','think','point','nod','encourage','celebrate','rest')

def validate(folder):
    results=[]
    for name in TAKES:
        path=folder/(name+'.mp4')
        raw=subprocess.run(['ffprobe','-v','error','-show_streams','-of','json',str(path)],capture_output=True,text=True,check=True)
        streams=json.loads(raw.stdout)['streams']
        if len(streams)!=1 or streams[0].get('codec_type')!='video':
            raise ValueError(f'{name}: expected one silent video stream')
        stream=streams[0];frames=180 if name=='idle' else 96
        expected={'codec_name':'h264','width':720,'height':720,'pix_fmt':'yuv420p','r_frame_rate':'30/1','nb_frames':str(frames)}
        if any(stream.get(key)!=value for key,value in expected.items()):
            raise ValueError(f'{name}: media format differs from v2 profile')
        if abs(float(stream['duration'])-frames/30)>.01:
            raise ValueError(f'{name}: unexpected duration')
        subprocess.run(['ffmpeg','-v','error','-i',str(path),'-f','null','-'],check=True)
        results.append({'name':name,'file':path.name,'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'frames':frames,'seconds':frames/30})
    return {'version':2,'width':720,'height':720,'fps':30,'codec':'h264','pixel_format':'yuv420p','audio':False,'full_decode_passed':True,'total_bytes':sum(r['bytes'] for r in results),'takes':results}

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('folder',type=Path);parser.add_argument('--output',type=Path,required=True);args=parser.parse_args()
    result=validate(args.folder);args.output.write_text(json.dumps(result,indent=2)+'\n');print(f"Validated {len(result['takes'])} clips, {result['total_bytes']} bytes")
