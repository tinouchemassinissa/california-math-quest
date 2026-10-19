import { FAMILY_VERSION,MAX_TOTAL_BYTES,validateLearner,validateWork,validatePlan,validateFileBytes,parseBackup,validateLearningBackup } from './familyModel.js';
import { journeyCatalog,journeyStorageKey } from '../game/learningJourney.js';
let opening;
function database(){
 if(!globalThis.indexedDB)return Promise.reject(new Error('Local storage is unavailable in this browser.'));
 if(!opening)opening=new Promise((resolve,reject)=>{const req=indexedDB.open('bip-family-local',1);req.onupgradeneeded=()=>{for(const name of ['learners','works','plans'])req.result.createObjectStore(name,{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>{opening=null;reject(req.error);};req.onblocked=()=>{opening=null;reject(new Error('Close other Bip tabs, then try again.'));};});return opening;
}
async function transact(stores,mode,body){const db=await database();return new Promise((resolve,reject)=>{const tx=db.transaction(stores,mode);let value;try{value=body(tx);}catch(error){tx.abort();reject(error);return;}tx.oncomplete=()=>resolve(typeof value==='function'?value():value);tx.onerror=tx.onabort=()=>reject(tx.error||new Error('Local changes could not be saved'));});}
export async function loadFamily(){return transact(['learners','works','plans'],'readonly',tx=>{const learners=tx.objectStore('learners').getAll(),works=tx.objectStore('works').getAll(),plans=tx.objectStore('plans').getAll();return ()=>({learners:learners.result,works:works.result,plans:plans.result});});}
export async function saveLearner(record){const clean=validateLearner(record);return transact(['learners'],'readwrite',tx=>tx.objectStore('learners').put(clean));}
export async function saveWork(record){const data=await loadFamily();validateWork(record,data.learners);if(!(record.file instanceof Blob))throw new Error('Attachment missing');validateFileBytes(await record.file.arrayBuffer(),record.type);await checkStorageRoom(record.file.size);return transact(['works'],'readwrite',tx=>{const store=tx.objectStore('works'),all=store.getAll();all.onsuccess=()=>{const total=all.result.filter(w=>w.id!==record.id).reduce((n,w)=>n+w.file.size,record.file.size);if(total>MAX_TOTAL_BYTES){tx.abort();return;}store.put(record);};});}
export async function removeWork(id){return transact(['works'],'readwrite',tx=>tx.objectStore('works').delete(id));}
export async function savePlan(plan){const data=await loadFamily();validatePlan(plan,data.learners);return transact(['plans'],'readwrite',tx=>tx.objectStore('plans').put(plan));}
function encode(bytes){let str='';for(let i=0;i<bytes.length;i+=8192)str+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(str);}
function decode(str){const decoded=atob(str),bytes=new Uint8Array(decoded.length);for(let i=0;i<bytes.length;i++)bytes[i]=decoded.charCodeAt(i);return bytes;}
function collectLearning(learners){
 const entries=[];if(!globalThis.localStorage)return entries;
 for(const learner of learners)for(const lesson of journeyCatalog(learner.grade))for(const suffix of ['',':progress']){
  const key=journeyStorageKey(learner.id,learner.grade,lesson.id)+suffix,value=localStorage.getItem(key);
  if(value!==null)entries.push({key,value});
 }
 return validateLearningBackup(entries,learners);
}
export async function exportFamily(){const data=await loadFamily();const works=[];for(const w of data.works){const {file,...metadata}=w;works.push({...metadata,data:encode(new Uint8Array(await file.arrayBuffer()))});}return new Blob([JSON.stringify({version:FAMILY_VERSION,learners:data.learners,plans:data.plans,works,learning:collectLearning(data.learners)})],{type:'application/json'});}
export async function importFamily(text){const data=parseBackup(text);let total=0;const works=data.works.map(w=>{const {data,...metadata}=w;const bytes=validateFileBytes(decode(data),w.type);total+=bytes.length;return {...metadata,file:new Blob([bytes],{type:w.type})};});if(total>MAX_TOTAL_BYTES)throw new Error('Backup exceeds the 250 MB local collection limit');
 await checkStorageRoom(total);
 // Preflight both stores; never overwrite an existing learning record.
 if(data.learning.length&&!globalThis.localStorage)throw new Error('Learning storage is unavailable');
 if(data.learning.some(e=>localStorage.getItem(e.key)!==null))throw new Error('Learning records already exist. Restore in a fresh browser.');
 const written=[];
 try{
  for(const entry of data.learning){localStorage.setItem(entry.key,entry.value);written.push(entry.key);}
  return await transact(['learners','works','plans'],'readwrite',tx=>{const oldLearners=tx.objectStore('learners').getAll(),oldWorks=tx.objectStore('works').getAll(),oldPlans=tx.objectStore('plans').getAll();let ready=0;const merge=()=>{if(++ready!==3)return;const hasCollision=data.learners.some(n=>oldLearners.result.some(o=>o.id===n.id&&(o.name!==n.name||o.grade!==n.grade)))||works.some(n=>oldWorks.result.some(o=>o.id===n.id))||data.plans.some(n=>oldPlans.result.some(o=>o.id===n.id));const size=oldWorks.result.reduce((n,w)=>n+w.file.size,total);if(hasCollision||size>MAX_TOTAL_BYTES){tx.abort();return;}data.learners.forEach(p=>tx.objectStore('learners').put(p));works.forEach(w=>tx.objectStore('works').put(w));data.plans.forEach(p=>tx.objectStore('plans').put(p));};oldLearners.onsuccess=merge;oldWorks.onsuccess=merge;oldPlans.onsuccess=merge;});
 }catch(error){for(const key of written)localStorage.removeItem(key);throw error;}
}

export async function storageHealth(){
 try{const estimate=await globalThis.navigator?.storage?.estimate?.();return {usage:estimate?.usage??null,quota:estimate?.quota??null,persisted:await globalThis.navigator?.storage?.persisted?.()??false};}catch{return {usage:null,quota:null,persisted:false};}
}
export async function checkStorageRoom(bytes){
 const {usage,quota}=await storageHealth();
 if(quota!==null&&usage!==null&&quota-usage<bytes+1024*1024)throw new Error('Your browser is running low on space. Save a backup, remove old work or choose a smaller file.');
}
