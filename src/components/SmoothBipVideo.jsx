import React,{useEffect,useRef} from 'react';

// The old clip interface now drives a transparent local 3D character.
export default function BipCharacter({src,eventKey,paused,loop,onError,onEnded,onReady}){
 const frame=useRef(null),latest=useRef(null),callbacks=useRef({onError,onEnded,onReady});
 callbacks.current={onError,onEnded,onReady};
 const key=(src||'').split('/').pop()?.replace('.mp4','')||'idle';
 const gesture={healthy:'idle',recovery:'nod',busy:'think',sleep:'rest'}[key]||key;
 latest.current={type:'bip-motion',paused:paused===true,state:gesture==='think'?'think':'idle',gesture:['idle','think'].includes(gesture)?undefined:gesture};
 const loaded=()=>{
  try{if(!frame.current?.contentDocument?.getElementById("bip-stage")){callbacks.current.onError?.();return;}}catch{callbacks.current.onError?.();return;}
  send();
 };
 const send=()=>frame.current?.contentWindow?.postMessage(latest.current,window.location.origin);
 useEffect(()=>{send();},[src,eventKey,paused]);
 useEffect(()=>{
  const receive=e=>{
   if(e.source!==frame.current?.contentWindow||e.origin!==window.location.origin)return;
   if(e.data?.type==='bip-motion-ready'){send();callbacks.current.onReady?.();}
   if(e.data?.type==='bip-motion-fallback')callbacks.current.onError?.();
   if(e.data?.type==='bip-motion-ended'&&!loop&&e.data.gesture===latest.current.gesture)callbacks.current.onEnded?.();
  };
  window.addEventListener('message',receive);return()=>window.removeEventListener('message',receive);
 },[loop]);
 return <iframe ref={frame} src="/bip/character/index.html?controls=none" title="Bip 3D companion" className="bip-character-frame" loading="lazy" sandbox="allow-scripts allow-same-origin" onLoad={loaded}/>;
}
