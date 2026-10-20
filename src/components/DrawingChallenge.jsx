import React,{useState,useEffect} from 'react';
import {DRAWING_ACTIVITIES,checkDrawnShape} from '../game/drawingActivities.js';
export default function DrawingChallenge({onActivityChange}) {
 const [activity,setActivity]=useState('triangle'),[step,setStep]=useState(0),[points,setPoints]=useState([]),[closed,setClosed]=useState(false),[result,setResult]=useState(null);
 const task=DRAWING_ACTIVITIES.find(a=>a.id===activity), structured=['triangle','square','rectangle'].includes(activity);
 useEffect(()=>{setStep(0);setPoints([]);setClosed(false);setResult(null);onActivityChange?.(activity);},[activity]);
 function addPoint(x,y){if(closed)return;setResult(null);setPoints(prev=>prev.some(p=>p.x===x&&p.y===y)?prev:[...prev,{x,y}]);}
 return <section className="drawing-challenge" aria-label="Drawing challenges">
 <label>Choose a drawing challenge <select value={activity} onChange={e=>setActivity(e.target.value)}>{DRAWING_ACTIVITIES.map(a=><option key={a.id} value={a.id}>{a.label}</option>)}</select></label>
 <ol className="drawing-step-list">{task.steps.map((text,i)=><li key={text} aria-current={i===step?'step':undefined} className={i===step?'current':''}>{i<step?'✓ ':''}{text}</li>)}</ol>
 <div className="drawing-step-actions"><button type="button" className="btn btn-secondary" disabled={step===0} onClick={()=>setStep(s=>s-1)}>Back a step</button><button type="button" className="btn btn-primary" disabled={step===2} onClick={()=>setStep(s=>s+1)}>Next small step →</button></div>
 {structured ? <>
 <p>Tap dots to choose corners in order. Then close your shape. You can also use a keyboard.</p>
 <div className="shape-builder">
 <svg viewBox="0 0 360 280" aria-hidden="true"><polyline points={points.concat(closed&&points.length?[points[0]]:[]).map(p=>`${20+p.x*40},${20+p.y*40}`).join(' ')} fill={closed?'#38bdf830':'none'} stroke="#38bdf8" strokeWidth="4" strokeLinejoin="round"/></svg>
 <div className="shape-dot-grid">{Array.from({length:63},(_,i)=>{const x=i%9,y=Math.floor(i/9),chosen=points.findIndex(p=>p.x===x&&p.y===y);return <button key={i} type="button" disabled={closed} aria-label={`Corner at column ${x}, row ${y}`} aria-pressed={chosen>=0} onClick={()=>addPoint(x,y)}>{chosen>=0?chosen+1:'·'}</button>;})}</div>
 </div>
 <div className="drawing-step-actions"><button type="button" className="btn btn-secondary" disabled={!points.length} onClick={()=>{if(closed)setClosed(false);else setPoints(p=>p.slice(0,-1));setResult(null);}}>Undo corner</button><button type="button" className="btn btn-secondary" disabled={points.length<3||closed} onClick={()=>{setClosed(true);setResult(null);}}>Close shape</button><button type="button" className="btn btn-primary" onClick={()=>setResult(checkDrawnShape(points,activity,closed))}>Check my shape</button><button type="button" className="btn btn-secondary" onClick={()=>{setPoints([]);setClosed(false);setResult(null);}}>Start shape again</button></div>
 <p role="status">{result?.message}</p><small>This checks the corners and straight sides you built here. It does not grade freehand drawings.</small>
 </> : <p>Use the paper below for this challenge. Follow the checklist to review your own drawing. Bip cannot automatically check freehand marks.</p>}
 </section>;
}
