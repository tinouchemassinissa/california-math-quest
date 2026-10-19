import React,{useState,useEffect} from 'react';
import {createWorkPackage,reviewWorkPackage,importWorkPackage,protectPackage,readPackage} from '../family/portableWork.js';
import {parseBackup,localDate} from '../family/familyModel.js';
import {exportFamily,importFamily} from '../family/familyStore.js';
import {downloadBlob} from '../family/useFamily.js';
export default function FamilyTransfer({data,ids=[],profile,run,busy,full=false}){
 const [notes,setNotes]=useState(false),[password,setPassword]=useState(''),[locked,setLocked]=useState(false),[prepared,setPrepared]=useState(null),[incoming,setIncoming]=useState(null),[review,setReview]=useState(null),[message,setMessage]=useState(''),[error,setError]=useState('');
 const selectionKey=ids.join('|');
 useEffect(()=>{setPrepared(null);},[selectionKey]);
 const act=async fn=>{setError('');try{await fn();}catch(e){setError(e.message);}};
 const prepare=()=>act(async()=>{
  let blob=full?await exportFamily():new Blob([JSON.stringify(await createWorkPackage(data,ids,{includeNotes:notes}))],{type:'application/json'});
  if(locked)blob=await protectPackage(blob,password);
  setPrepared(new File([blob],`bip-${full?'family-backup':'homework'}-${localDate()}${locked?'-protected':''}.json`,{type:'application/json'}));setMessage('File prepared. Save or share it below; this does not synchronize devices.');
 });
 return <section className="family-transfer"><h3>{full?'Transfer my library':'Share selected homework'}</h3>
 <p>{full?'Includes all learner names, attachments, notes, plans and registered learner progress. Guest sessions are excluded.':'Includes selected files, titles, dates and linked practice. Learner names, progress and completion status are excluded.'}</p>
 {!full&&<label><input type="checkbox" checked={notes} onChange={e=>{setNotes(e.target.checked);setPrepared(null);}}/> Include adult notes</label>}
 <p className="family-small">Check titles and the pages themselves for names or private information before sharing. Images are not automatically anonymized.</p>
 <label><input type="checkbox" checked={locked} onChange={e=>{setLocked(e.target.checked);setPrepared(null);}}/> Protect exported file with a passphrase</label>
 {locked&&<label>Passphrase (12+ characters)<input type="password" autoComplete="new-password" minLength={12} value={password} onChange={e=>{setPassword(e.target.value);setPrepared(null);}}/><small>Keep it separately. A forgotten passphrase cannot be recovered. Browser folders remain unlocked.</small></label>}
 <div className="family-actions"><button type="button" className="btn btn-primary" disabled={busy||(!full&&!ids.length)} onClick={()=>run(prepare)}>Prepare {full?'backup':`${ids.length} selected`}</button>
 {prepared&&<><button type="button" className="btn btn-secondary" onClick={()=>act(async()=>{
 if(window.showSaveFilePicker){const handle=await window.showSaveFilePicker({suggestedName:prepared.name,types:[{description:'Bip package',accept:{'application/json':['.json']}}]});const stream=await handle.createWritable();await stream.write(prepared);await stream.close();}else downloadBlob(prepared,prepared.name);
 setMessage('Save requested. Check your device’s files before deleting any originals.');
 })}>Save to device</button><button type="button" className="btn btn-secondary" onClick={()=>act(async()=>{if(navigator.canShare?.({files:[prepared]})){await navigator.share({files:[prepared],title:'Learn with Bip'});setMessage('Shared through your device.');}else{downloadBlob(prepared,prepared.name);setMessage('File downloaded. Attach it using your preferred sharing app.');}})}>Share copy</button></>}
 </div>{prepared&&<p className="family-small">Prepared snapshot · {(prepared.size/1024/1024).toFixed(1)} MB. Prepare again after changing your homework.</p>}
 <p className="family-small">Files are unencrypted unless you enable passphrase protection. Large transfers can be slow; share smaller batches on phones.</p><hr/><h3>{full?'Restore library':'Import homework'}</h3><p>{full?'Use a fresh browser for a full transfer. Existing conflicting records are never overwritten.':'Choose a package, review it, then add copies to the selected learner’s folder. Repeat imports create additional copies.'}</p>
 <label className="btn btn-secondary family-file-button">Choose package<input type="file" accept=".json,application/json" onChange={e=>{setIncoming(e.target.files?.[0]||null);setReview(null);setError('');e.target.value='';}}/></label>
 {incoming&&<><p>{incoming.name}</p><label>Passphrase, if protected<input type="password" autoComplete="off" value={password} onChange={e=>{setPassword(e.target.value);setReview(null);}}/></label><button type="button" className="btn btn-secondary" disabled={busy} onClick={()=>run(()=>act(async()=>{const raw=await readPackage(incoming,password);const clean=full?parseBackup(raw):reviewWorkPackage(raw);setReview({raw,clean});}))}>Preview import</button></>}
 {review&&<div className="family-draft"><h4>Review before importing</h4><p>{review.clean.works.length} homework files · {review.clean.learners.length} folders · {review.clean.plans.length} plans · {review.clean.learning.length} learning records</p><ul>{review.clean.works.map(w=><li key={w.id}>{w.title} · {w.date}</li>)}</ul>
 {!full&&<p>Destination: <strong>{profile?.name||'Add a learner first'}</strong> · Grade {profile?.grade}. Grades must match.</p>}
 <button type="button" className="btn btn-primary" disabled={busy||(!full&&!profile)} onClick={()=>run(async()=>{if(full)await importFamily(review.raw);else await importWorkPackage(review.raw,profile);setReview(null);setIncoming(null);setMessage('Imported on this device. The other device’s copy is unchanged.');})}>Confirm import</button></div>}
 {error&&<p role="alert" className="family-alert">{error}</p>}{message&&<p role="status">{message}</p>}
 </section>;
}
