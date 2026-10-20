import React,{useState} from 'react';
import {DRAWING_ACTIVITIES} from '../game/drawingActivities.js';
import DrawingChallenge from './DrawingChallenge.jsx';
import ScratchpadCanvas from './ScratchpadCanvas.jsx';
const icons={triangle:'🔺',rectangle:'▭',square:'⬜',shade:'◒',counters:'●',symmetry:'🦋',area:'📐',groups:'🟣',fraction:'◐',line:'↗'};
export default function MathLab({onClose}){
 const [activity,setActivity]=useState(null);
 const task=DRAWING_ACTIVITIES.find(a=>a.id===activity);
 return <section className="math-lab" aria-label="Math Lab">
 <button type="button" className="btn btn-secondary" onClick={onClose}>← My world</button>
 <h2>Math Lab</h2>
 {!task?<><p>Choose one thing to build or explore. Take your time—no quiz is running here.</p>
 <div className="kids-activity-grid">{DRAWING_ACTIVITIES.map(a=><button key={a.id} type="button" onClick={()=>setActivity(a.id)}><span aria-hidden="true">{icons[a.id]}</span><strong>{a.label}</strong><small>{['groups','fraction','line'].includes(a.id)?'Draw and review with a checklist':'Build and check with Bip'}</small></button>)}</div></>:<>
 <button type="button" className="btn btn-secondary" onClick={()=>setActivity(null)}>← Choose another activity</button><h3>{task.label}</h3>
 <DrawingChallenge key={activity} initialActivity={activity} hidePicker/>
 {['groups','fraction','line'].includes(activity)&&<ScratchpadCanvas questionId={'lab-'+activity} practiceOnly/>}
 </>}
 </section>;
}
