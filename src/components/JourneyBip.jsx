import SmoothBipVideo from './SmoothBipVideo.jsx';
import React,{useEffect,useState} from 'react';
import { bipLessonReaction, BIP_IDLE_CLIP, BIP_WAVE_CLIP, BIP_FALLBACK_CLIP } from '../game/bipLessonReaction.js';

export default function JourneyBip({phase,feedback,help,eventKey,cue}){
  const [paused,setPaused]=useState(()=>typeof window!=='undefined'&&Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches));
  const [manual,setManual]=useState(null);
  const [failed,setFailed]=useState(0);
  const [settled,setSettled]=useState(false);
  const [replay,setReplay]=useState(0);
  const reaction=bipLessonReaction({phase,feedback,help});
  if(cue&&(help||phase==='lesson'||phase==='guided'||(feedback&&!feedback.correct)))reaction.label=cue;
  const clip=failed===1?BIP_FALLBACK_CLIP:manual==='wave'?BIP_WAVE_CLIP:settled?BIP_IDLE_CLIP:reaction.clip;
  const gesture=paused?'still':manual==='wave'?'wave':settled?'breathe':reaction.gesture;
  useEffect(()=>{setManual(null);setFailed(0);setSettled(false);},[eventKey,phase,help,feedback?.correct]);
  useEffect(()=>{
    const media=window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const change=e=>{if(e.matches)setPaused(true);};
    media?.addEventListener('change',change);
    return ()=>media?.removeEventListener('change',change);
  },[]);
  useEffect(()=>()=>{if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();},[]);
  const read=()=>{if(typeof speechSynthesis==='undefined')return;speechSynthesis.cancel();const line=new SpeechSynthesisUtterance(reaction.label);line.rate=.9;speechSynthesis.speak(line);};
  return <aside className={`journey-bip bip-rendered-motion gesture-${gesture}`} data-motion={paused?'paused':'playing'} aria-label="Bip learning companion">
    <div className="journey-bip-scene"><div className="journey-bip-halo"/>{failed>=2?<img src="/bip/gestures/poster.webp" alt="Bip"/>:<SmoothBipVideo src={`/bip/${clip}`} eventKey={`${eventKey}-${replay}`} paused={paused} loop={failed===1||settled||(!manual&&reaction.loop)} onError={()=>setFailed(v=>Math.min(2,v+1))} onEnded={()=>{setManual(null);setSettled(true);}}/>}<span className="journey-bip-spark" aria-hidden="true">✦</span></div>
    <div className="journey-bip-message"><strong>Bip · Your learning buddy</strong><p role="status">{reaction.label}</p></div>
    <div className="journey-bip-controls"><button type="button" onClick={()=>{setManual('wave');setFailed(0);setSettled(false);setReplay(v=>v+1);}}>👋 Wave</button><button type="button" aria-pressed={paused} onClick={()=>setPaused(v=>!v)}>{paused?'▶ Animate':'Ⅱ Pause'}</button><button type="button" onClick={read}>🔊 Read</button></div>
    <p className="journey-bip-note">Sound plays only when you tap Read.</p>
  </aside>;
}
