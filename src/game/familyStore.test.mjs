import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {loadFamily,saveLearner,saveWork,removeWork,savePlan,exportFamily,importFamily} from '../family/familyStore.js';
const learner={id:'child-1',name:'Star',grade:'3'};
const bytes=new TextEncoder().encode('%PDF-test-original');
const work={id:'page-1',learnerId:learner.id,title:'Practice',date:'2026-10-18',status:'to-do',notes:'Use groups.',lessonId:'multiply',type:'application/pdf',filename:'page.pdf',file:new Blob([bytes],{type:'application/pdf'})};
test('family database preserves attachments and atomically rejects a conflicting restore',async()=>{
 await saveLearner(learner);await saveWork(work);await savePlan({id:'today-1',learnerId:learner.id,date:'2026-10-18',lessons:['multiply']});
 const saved=await loadFamily();assert.equal(saved.works[0].file.size,bytes.length);assert.equal(await saved.works[0].file.text(),'%PDF-test-original');
 const backup=await exportFamily(),raw=JSON.parse(await backup.text());assert.equal(raw.works.length,1);assert.equal(typeof raw.works[0].data,'string');assert.ok(!('file' in raw.works[0]));
 await assert.rejects(()=>importFamily(JSON.stringify(raw)));assert.equal((await loadFamily()).works.length,1);
 const renamed={...raw,learners:[{...learner,id:'child-2',name:'Moon'}],works:[{...raw.works[0],id:'page-2',learnerId:'child-2'}],plans:[{...raw.plans[0],id:'today-2',learnerId:'child-2'}]};
 await importFamily(JSON.stringify(renamed));const restored=await loadFamily();assert.equal(restored.works.length,2);assert.equal(await restored.works.find(w=>w.id==='page-2').file.text(),'%PDF-test-original');
 const corrupted={...renamed,learners:[{...learner,id:'child-3'}],works:[{...renamed.works[0],id:'page-3',learnerId:'child-3',data:btoa('<html>')}],plans:[]};
 await assert.rejects(()=>importFamily(JSON.stringify(corrupted)));assert.equal((await loadFamily()).learners.length,2);
 await removeWork('page-1');assert.equal((await loadFamily()).works.length,1);
 await assert.rejects(()=>saveWork({...work,id:'page-bad',learnerId:'absent'}));
});

test('backup carries learner results and resume state; failed restore rolls learning back',async()=>{
 const {journeyStorageKey,journeyProgressKey,createJourney,journeySummary}=await import('./learningJourney.js');
 const values=new Map();globalThis.localStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,String(v)),removeItem:k=>values.delete(k)};
 const resultKey=journeyStorageKey(learner.id,'3','multiply'),progressKey=journeyProgressKey(learner.id,'3','multiply');
 values.set(resultKey,JSON.stringify(journeySummary(createJourney('3','multiply'),1000)));
 values.set(progressKey,JSON.stringify({version:1,state:createJourney('3','multiply')}));
 const backup=JSON.parse(await (await exportFamily()).text());assert.equal(backup.learning.length,2);
 const restored={version:1,learners:[{...learner,id:'restore-1'}],works:[],plans:[],learning:backup.learning.map(e=>({...e,key:e.key.replace('child-1','restore-1')}))};
 await importFamily(JSON.stringify(restored));assert.equal(values.has(restored.learning[1].key),true);
 await assert.rejects(()=>importFamily(JSON.stringify(restored)));
 const failed={...restored,learners:[{...learner,id:'restore-2'}],learning:backup.learning.map(e=>({...e,key:e.key.replace('child-1','restore-2')})),works:[{...backup.works[0],learnerId:'restore-2'}]};
 await assert.rejects(()=>importFamily(JSON.stringify(failed)));assert.equal(values.has(failed.learning[0].key),false);
 const corrupt={...restored,learning:[{key:restored.learning[1].key,value:'{}'}]};await assert.rejects(()=>importFamily(JSON.stringify(corrupt)));
 delete globalThis.localStorage;
});
