import React,{useState} from 'react';
import {SYMMETRY_LEFT,AREA_CELLS,cellKey,checkFractionShade,checkCounterGroups,checkSymmetry,checkAreaModel} from '../game/visualMathActivities.js';
export default function VisualMathActivity({activity}) {
 const [selected,setSelected]=useState([]),[positions,setPositions]=useState(Array(12).fill(-1)),[counter,setCounter]=useState(null),[perimeter,setPerimeter]=useState(''),[result,setResult]=useState(null);
 const toggle=key=>{setSelected(prev=>prev.includes(key)?prev.filter(k=>k!==key):[...prev,key]);setResult(null);};
 const move=group=>{if(counter===null)return;setPositions(prev=>prev.map((p,i)=>i===counter?group:p));setCounter(null);setResult(null);};
 const check=()=>setResult(activity==='shade'?checkFractionShade(selected):activity==='counters'?checkCounterGroups(positions):activity==='symmetry'?checkSymmetry(selected):checkAreaModel(selected,perimeter));
 const grid=(rows,cols,render)=> <div className="visual-cell-grid" style={{gridTemplateColumns:`repeat(${cols},1fr)`}}>{Array.from({length:rows*cols},(_,i)=>render(i%cols,Math.floor(i/cols)))}</div>;
 return <div className="visual-math-activity">
 {activity==='shade'&&<>
 <h4>Make 3/8 of one whole</h4><p>This rectangle is one whole, split into eight equal parts. Tap parts to shade them; tap again to undo.</p>
 {grid(2,4,(x,y)=>{const key=cellKey([x,y]);return <button type="button" key={key} aria-label={`Fraction part ${y*4+x+1}`} aria-pressed={selected.includes(key)} onClick={()=>toggle(key)} className={selected.includes(key)?'filled':''}/>;})}
 <p>{selected.length} of 8 parts shaded</p></>}
 {activity==='counters'&&<>
 <h4>Share 12 counters into 3 equal groups</h4><p>Select a counter, then choose its destination. Move it again whenever you like. All groups need the same number.</p>
 <div className="counter-board">{[-1,0,1,2].map(g=><section key={g}><h5>{g===-1?'Tray':`Group ${g+1}`}</h5><div className="counter-pieces">{positions.map((p,i)=>p===g&&<button key={i} type="button" className="counter-piece" aria-label={`Counter ${i+1}`} aria-pressed={counter===i} onClick={()=>setCounter(i)}>●</button>)}</div><button type="button" className="btn btn-secondary" disabled={counter===null} onClick={()=>move(g)}>{g===-1?'Return to tray':'Place selected counter here'}</button><p>{positions.filter(p=>p===g).length} counters</p></section>)}</div></>}
 {activity==='symmetry'&&<>
 <h4>Finish the mirror picture</h4><p>Keep the left side as it is. Tap squares on the right to reflect it across the dashed line.</p>
 {grid(4,6,(x,y)=>{const key=cellKey([x,y]),fixed=x<3,filled=fixed?SYMMETRY_LEFT.some(p=>cellKey(p)===key):selected.includes(key);return <button type="button" key={key} className={`${filled?'filled':''} ${x===2?'mirror-edge':''}`} disabled={fixed} aria-label={`${fixed?'Example':'Mirror'} row ${y+1}, column ${x+1}`} aria-pressed={filled} onClick={()=>toggle(key)}/>;})}</>}
 {activity==='area'&&<>
 <h4>Cover the rectangle, then walk its boundary</h4><p>Each square is 1 unit by 1 unit. Tap every square inside the outlined rectangle. Then count the unit edges around its outside.</p>
 {grid(5,6,(x,y)=>{const key=cellKey([x,y]),inside=AREA_CELLS.some(p=>cellKey(p)===key);return <button type="button" key={key} className={`${selected.includes(key)?'filled':''} ${inside?'area-inside':''} ${inside&&x===1?'edge-left':''} ${inside&&x===4?'edge-right':''} ${inside&&y===1?'edge-top':''} ${inside&&y===3?'edge-bottom':''}`} aria-label={`Area tile row ${y+1}, column ${x+1}`} aria-pressed={selected.includes(key)} onClick={()=>toggle(key)}/>;})}
 <p>{selected.length} square units covered</p><label>Perimeter in units <input aria-label="Perimeter in units" inputMode="numeric" value={perimeter} onChange={e=>{setPerimeter(e.target.value);setResult(null);}}/></label></>}
 <div className="drawing-step-actions"><button type="button" className="btn btn-primary" onClick={check}>Check my model</button><button type="button" className="btn btn-secondary" onClick={()=>{setSelected([]);setPositions(Array(12).fill(-1));setCounter(null);setPerimeter('');setResult(null);}}>Start model again</button></div>
 <p role="status">{result?.message}</p><small>Bip checks this model only. This is practice, with no timer or lost hearts.</small>
 </div>;
}
