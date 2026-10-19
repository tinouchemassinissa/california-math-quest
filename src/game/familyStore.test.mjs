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
