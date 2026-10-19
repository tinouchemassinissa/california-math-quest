import React,{useEffect,useRef,useState} from 'react';

import { bipLessonReaction } from '../game/bipLessonReaction.js';
export default function JourneyBip({phase,feedback,help,eventKey}){
  const video=useRef(null);
  const [paused,setPaused]=useState(()=>typeof window!=='undefined'&&Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  const [manual,setManual]=useState(null);
  const [failed,setFailed]=useState(false);
  const reaction=bipLessonReaction({phase,feedback,help});
  const clip=manual==='wave'?'greeting.mp4':manual==='idle'?'events/Bip_healthy_4K60.mp4':reaction.clip;
  useEffect(()=>{setManual(null);setFailed(false);},[eventKey,phase,help]);
  useEffect(()=>{if(!video.current)return;if(paused)video.current.pause();else video.current.play()?.catch(()=>{});},[clip,paused,eventKey]);
  useEffect(()=>()=>{if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();},[]);
  const read=()=>{if(typeof speechSynthesis==='undefined')return;speechSynthesis.cancel();const line=new SpeechSynthesisUtterance(reaction.label);line.rate=.9;speechSynthesis.speak(line);};
  return <aside className={`journey-bip gesture-${paused?'still':reaction.gesture}`} aria-label="Bip learning companion">
    <div className="journey-bip-scene"><div className="journey-bip-halo"/>{failed?<img src="/pwa-512x512.png" alt="Bip"/>:<video key={`${clip}-${eventKey}`} ref={video} src={`/bip/${clip}`} poster="/pwa-512x512.png" muted playsInline autoPlay={!paused} loop={manual==='idle'||(!manual&&reaction.loop)} onError={()=>setFailed(true)} onEnded={()=>setManual('idle')} aria-label="Animated Bip companion"/>}<span className="journey-bip-spark" aria-hidden="true">✦</span></div>
    <div className="journey-bip-message"><strong>Bip · Your learning buddy</strong><p role="status">{reaction.label}</p></div>
    <div className="journey-bip-controls"><button type="button" onClick={()=>{setPaused(false);setManual(manual==='wave'?null:'wave');}}>👋 Wave</button><button type="button" onClick={()=>setPaused(v=>!v)}>{paused?'▶ Animate':'Ⅱ Pause'}</button><button type="button" onClick={read}>🔊 Read</button></div>
    <p className="journey-bip-note">Sound plays only when you tap Read.</p>
  </aside>;
}
