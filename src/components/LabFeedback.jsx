import React,{useEffect,useRef,useState} from 'react';
import JourneyBip from './JourneyBip.jsx';
export default function LabFeedback({result,onHelp}) {
 const panel=useRef(null),[replay,setReplay]=useState(0);
 useEffect(()=>{
   if(!result)return;
   setReplay(n=>n+1);
   panel.current?.focus({preventScroll:true});
   panel.current?.scrollIntoView?.({block:'nearest',behavior:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
 },[result]);
 if(!result)return null;
 return <section className={'lab-feedback '+(result.ok?'lab-feedback-success':'lab-feedback-retry')} aria-label={result.ok?'Model correct':'Let’s try again'} tabIndex={-1} ref={panel}>
 <h4>{result.ok?'✓ You did it!':'↻ Not quite yet—let’s try together'}</h4>
 <JourneyBip phase="guided" feedback={{correct:result.ok}} eventKey={'lab-check-'+replay} message={result.message}/>
 {!result.ok&&<p>Your work is still here. Change one small part, then check again.</p>}
 {!result.ok&&onHelp&&<button type="button" className="btn btn-primary" onClick={onHelp}>Help me with the next step</button>}
 </section>;
}
