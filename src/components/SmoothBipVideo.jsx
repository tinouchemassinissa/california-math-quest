import React,{useEffect,useRef,useState} from 'react';

// Keep the last rendered frame while the next local clip loads. Only one plays.
export default function SmoothBipVideo({src,eventKey,paused,loop,onError,onEnded,onReady}){
 const refs=useRef([]),activeRef=useRef(0),request=useRef(0),pending=useRef({index:0,id:0});
 const lastFailed=useRef(-1);
 const [active,setActive]=useState(0);
 const [layers,setLayers]=useState([{src,eventKey,id:0},null]);
 useEffect(()=>{
  const current=layers[activeRef.current];
  if(current?.src===src&&current?.eventKey===eventKey)return;
  const index=1-activeRef.current,id=++request.current;pending.current={index,id};
  setLayers(previous=>previous.map((layer,i)=>i===index?{src,eventKey,id}:layer));
 },[src,eventKey]);
 useEffect(()=>{refs.current.forEach((element,index)=>{if(!element)return;if(paused||document.visibilityState==='hidden'||index!==active)element.pause();else element.play()?.catch(()=>{});});},[paused,active]);
 useEffect(()=>{const change=()=>{refs.current.forEach((element,index)=>{if(!element)return;if(paused||document.visibilityState==='hidden'||index!==activeRef.current)element.pause();else element.play()?.catch(()=>{});});};document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change);},[paused]);
 useEffect(()=>()=>refs.current.forEach(element=>element?.pause()),[]);
 const loaded=(index,id)=>{
  if(pending.current?.id!==id||pending.current.index!==index)return;
  refs.current[activeRef.current]?.pause();activeRef.current=index;setActive(index);pending.current=null;onReady?.();
  if(!paused&&document.visibilityState!=='hidden')refs.current[index]?.play()?.catch(()=>{});
 };
 return <div className="bip-video-stack">{layers.map((layer,index)=>layer&&<video key={layer.id} ref={element=>{refs.current[index]=element;}} src={layer.src} poster="/bip/gestures/poster.webp" muted playsInline preload="auto" loop={index===active&&loop} className={index===active?'is-visible':''} aria-hidden={index!==active} aria-label={index===active?'Animated Bip companion':undefined} onLoadedData={()=>loaded(index,layer.id)} onError={()=>{if(layer.id===request.current&&lastFailed.current!==layer.id){lastFailed.current=layer.id;onError?.();}}} onEnded={()=>{if(index===activeRef.current&&!pending.current)onEnded?.();}}/>)}</div>;
}
