import React,{useState} from 'react';
import {VISUAL_EXERCISES,fractionLayout,rectangleCells,boundaryEdges,cellKey,checkFractionShade,checkCounterGroups,checkSymmetry,checkAreaModel} from '../game/visualMathActivities.js';
export default function VisualMathActivity({activity}) {
 const [exercise,setExercise]=useState(0);
 const deck=VISUAL_EXERCISES[activity];
 return <><div className="lab-exercise-nav"><span>Exercise {exercise+1} of {deck.length}</span><button type="button" className="btn btn-secondary" disabled={exercise===0} onClick={()=>setExercise(i=>i-1)}>← Previous exercise</button><button type="button" className="btn btn-primary" disabled={exercise===deck.length-1} onClick={()=>setExercise(i=>i+1)}>Next exercise →</button></div><VisualModel key={activity+'-'+exercise} activity={activity} q={deck[exercise]}/></>;
}
function VisualModel({activity,q}) {
 const total=q.total||12, groups=q.groups||3, width=q.width||4,height=q.height||3;
 const fraction=fractionLayout(q.denominator||8), areaCells=rectangleCells(width,height);
 const [edgeHelp,setEdgeHelp]=useState(false),[edges,setEdges]=useState([]),[clue,setClue]=useState(false);
 const [selected,setSelected]=useState([]),[positions,setPositions]=useState(Array(total).fill(-1)),[counter,setCounter]=useState(null),[perimeter,setPerimeter]=useState(''),[result,setResult]=useState(null);
 const toggle=key=>{setSelected(prev=>prev.includes(key)?prev.filter(k=>k!==key):[...prev,key]);setResult(null);};
 const move=group=>{if(counter===null)return;setPositions(prev=>prev.map((p,i)=>i===counter?group:p));setCounter(null);setResult(null);};
 const check=()=>setResult(activity==='shade'?checkFractionShade(selected,q):activity==='counters'?checkCounterGroups(positions,q):activity==='symmetry'?checkSymmetry(selected,q):checkAreaModel(selected,perimeter,q));
 const grid=(rows,cols,render)=> <div className="visual-cell-grid" style={{gridTemplateColumns:`repeat(${cols},1fr)`}}>{Array.from({length:rows*cols},(_,i)=>render(i%cols,Math.floor(i/cols)))}</div>;
 return <div className="visual-math-activity">
 {activity==='shade'&&<>
 <h4>Make {q.numerator}/{q.denominator} of one whole</h4><p>This rectangle is one whole, split into {q.denominator} equal parts. Tap parts to shade them; tap again to undo.</p>
 {grid(fraction.rows,fraction.cols,(x,y)=>{const key=cellKey([x,y]);return <button type="button" key={key} aria-label={`Fraction part ${y*fraction.cols+x+1}`} aria-pressed={selected.includes(key)} onClick={()=>toggle(key)} className={selected.includes(key)?'filled':''}/>;})}
 <p>{selected.length} of {q.denominator} parts shaded</p></>}
 {activity==='counters'&&<>
 <h4>Share {total} counters into {groups} equal groups</h4><p>Select a counter, then choose its destination. Move it again whenever you like. All groups need the same number.</p>
 <div className="counter-board">{[-1,...Array.from({length:groups},(_,i)=>i)].map(g=><section key={g}><h5>{g===-1?'Tray':`Group ${g+1}`}</h5><div className="counter-pieces">{positions.map((p,i)=>p===g&&<button key={i} type="button" className="counter-piece" aria-label={`Counter ${i+1}`} aria-pressed={counter===i} onClick={()=>setCounter(i)}>●</button>)}</div><button type="button" className="btn btn-secondary" disabled={counter===null} onClick={()=>move(g)}>{g===-1?'Return to tray':'Place selected counter here'}</button><p>{positions.filter(p=>p===g).length} counters</p></section>)}</div></>}
 {activity==='symmetry'&&<>
 <h4>Finish the mirror picture</h4><p>Keep the left side as it is. Tap squares on the right to reflect it across the dashed line.</p>
 {grid(4,6,(x,y)=>{const key=cellKey([x,y]),fixed=x<3,filled=fixed?q.pattern.some(p=>cellKey(p)===key):selected.includes(key);return <button type="button" key={key} className={`${filled?'filled':''} ${x===2?'mirror-edge':''}`} disabled={fixed} aria-label={`${fixed?'Example':'Mirror'} row ${y+1}, column ${x+1}`} aria-pressed={filled} onClick={()=>toggle(key)}/>;})}</>}
 {activity==='area'&&<>
 <h4>Cover the rectangle, then walk its boundary</h4><p>Each square is 1 unit by 1 unit. Tap every square inside the outlined rectangle. Then count the unit edges around its outside.</p>
 <div className="area-counting-picture">{grid(5,6,(x,y)=>{const key=cellKey([x,y]),inside=areaCells.some(p=>cellKey(p)===key);return <button type="button" key={key} className={`${selected.includes(key)?'filled':''} ${inside?'area-inside':''} ${inside&&x===1?'edge-left':''} ${inside&&x===width?'edge-right':''} ${inside&&y===1?'edge-top':''} ${inside&&y===height?'edge-bottom':''}`} aria-label={`Area tile row ${y+1}, column ${x+1}`} aria-pressed={selected.includes(key)} onClick={()=>toggle(key)}/>;})}
 {edgeHelp&&<div className="area-edge-overlay">{boundaryEdges(width,height).map(edge=><button type="button" key={edge.id} aria-label={'Count unit edge '+edge.id} aria-pressed={edges.includes(edge.id)} className={'unit-edge '+(edge.horizontal?'horizontal':'vertical')} style={{left:(edge.x/6*100)+'%',top:(edge.y/5*100)+'%',width:edge.horizontal?(100/6)+'%':'24px',height:edge.horizontal?'24px':(100/5)+'%'}} onClick={()=>setEdges(prev=>prev.includes(edge.id)?prev.filter(id=>id!==edge.id):[...prev,edge.id])}>{edges.includes(edge.id)?'✓':''}</button>)}</div>}</div>
 <button type="button" className="btn btn-secondary" aria-pressed={edgeHelp} onClick={()=>setEdgeHelp(v=>!v)}>{edgeHelp?'Hide edge helper':'Help me count outside edges'}</button>
 {edgeHelp&&<p role="status">{edges.length} unit edges marked. Tap each outside edge once; tap again to undo. Interior grid lines are not part of the perimeter.</p>}
 <p>{selected.length} square units covered</p><label>Perimeter in units <input aria-label="Perimeter in units" inputMode="numeric" value={perimeter} onChange={e=>{setPerimeter(e.target.value);setResult(null);}}/></label></>}
 <button type="button" className="btn btn-secondary" onClick={()=>setClue(v=>!v)}>Give me a clue</button>
 {clue&&<p className="lab-model-clue">{activity==='area'?'Area counts squares inside. Perimeter counts edges outside: across the top, down the right, across the bottom and up the left.':activity==='shade'?'The bottom number is the number of equal parts in the whole. The top number tells how many parts to shade.':activity==='counters'?'Deal one counter to each group, then repeat. Compare the groups before checking.':'Start with one row. Count how far a shaded square is from the mirror line, then shade its partner the same distance away.'}</p>}
 <div className="drawing-step-actions"><button type="button" className="btn btn-primary" onClick={check}>Check my model</button><button type="button" className="btn btn-secondary" onClick={()=>{setSelected([]);setPositions(Array(total).fill(-1));setCounter(null);setPerimeter('');setEdges([]);setResult(null);}}>Start model again</button></div>
 <p role="status">{result?.message}</p><small>Bip checks this model only. This is practice, with no timer or lost hearts.</small>
 </div>;
}
