import 'fake-indexeddb/auto';
import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {createWorkPackage,reviewWorkPackage,importWorkPackage,protectPackage,readPackage} from '../family/portableWork.js';
import {loadFamily,saveLearner,saveWork,checkStorageRoom} from '../family/familyStore.js';
import {MAX_FILE_BYTES,MAX_TOTAL_BYTES,validateFileBytes} from '../family/familyModel.js';
const learner={id:'private-child',name:'Private Name',grade:'3'};
const work={id:'private-work',learnerId:learner.id,title:'Equal groups',date:'2026-10-19',status:'reviewed',notes:'Private notes',lessonId:'multiply',type:'application/pdf',filename:'private-name.pdf',file:new Blob(['%PDF-original'],{type:'application/pdf'})};
test('selected package defaults omit personal folder metadata, progress, notes and original names',async()=>{
 const raw=await createWorkPackage({learners:[learner],works:[work],plans:[]},[work.id]);
 assert.equal(raw.learners[0].name,'Learner 1');assert.equal(raw.works[0].notes,'');assert.equal(raw.works[0].filename,'worksheet-1.pdf');assert.equal(raw.works[0].status,'to-do');assert.deepEqual(raw.learning,[]);
 assert.ok(!JSON.stringify(raw).includes('Private Name'));assert.equal(reviewWorkPackage(raw).works.length,1);
 const opt=await createWorkPackage({learners:[learner],works:[work]},[work.id],{includeNotes:true});assert.equal(opt.works[0].notes,'Private notes');
 await assert.rejects(()=>createWorkPackage({learners:[],works:[]},[]));
 const corrupt=structuredClone(raw);corrupt.works[0].data=btoa('not a PDF');assert.throws(()=>reviewWorkPackage(corrupt));
 assert.throws(()=>reviewWorkPackage({...raw,learning:[{}]}));
});
test('portable import requires matching grade, makes fresh IDs, preserves originals and allows deliberate copies',async()=>{
 await saveLearner(learner);await saveWork(work);
 const raw=await createWorkPackage({learners:[learner],works:[work]},[work.id]);
 await assert.rejects(()=>importWorkPackage(raw,{...learner,grade:'4'}));
 await importWorkPackage(raw,learner);await importWorkPackage(raw,learner);
 const data=await loadFamily();assert.equal(data.works.length,3);assert.equal(new Set(data.works.map(w=>w.id)).size,3);
 assert.equal(data.works.find(w=>w.id===work.id).notes,'Private notes');assert.equal(await data.works.find(w=>w.id!==work.id).file.text(),'%PDF-original');
});
test('password file encryption roundtrip, wrong password and tamper rejection',async()=>{
 if(!globalThis.crypto)globalThis.crypto=webcrypto;
 const raw=await createWorkPackage({learners:[learner],works:[work]},[work.id]);const source=new Blob([JSON.stringify(raw)]);
 await assert.rejects(()=>protectPackage(source,'short'));
 const locked=await protectPackage(source,'a long private passphrase');assert.ok(!(await locked.text()).includes('Equal groups'));
 assert.deepEqual(await readPackage(locked,'a long private passphrase'),raw);
 await assert.rejects(()=>readPackage(locked,'wrong password'));
 const tampered=JSON.parse(await locked.text());tampered.data='A'+tampered.data.slice(1);await assert.rejects(()=>readPackage(new Blob([JSON.stringify(tampered)]),'a long private passphrase'));
});
test('larger caps accept formerly oversized PDF, reject over-limit and storage shortage',async()=>{
 assert.equal(MAX_FILE_BYTES,25*1024*1024);assert.equal(MAX_TOTAL_BYTES,250*1024*1024);
 const pdf=new Uint8Array(9*1024*1024);pdf.set(new TextEncoder().encode('%PDF-'));assert.equal(validateFileBytes(pdf,'application/pdf').length,pdf.length);
 assert.throws(()=>validateFileBytes(new Uint8Array(MAX_FILE_BYTES+1),'application/pdf'));
 const old=Object.getOwnPropertyDescriptor(globalThis,'navigator');Object.defineProperty(globalThis,'navigator',{configurable:true,value:{storage:{estimate:async()=>({usage:99,quota:100}),persisted:async()=>false}}});
 try{await assert.rejects(()=>checkStorageRoom(100),/running low/);}finally{if(old)Object.defineProperty(globalThis,'navigator',old);else delete globalThis.navigator;}
});
