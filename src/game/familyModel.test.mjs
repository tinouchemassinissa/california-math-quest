import test from 'node:test';
import assert from 'node:assert/strict';
import {validateLearner,validateWork,validatePlan,validateFileBytes,validDate,suggestHomework,parseBackup,parentStrategy} from '../family/familyModel.js';
const learner={id:'learner-1',name:'Moon',grade:'3'};
const work={id:'work-1',learnerId:'learner-1',title:'Equal groups',date:'2026-10-18',status:'to-do',notes:'Draw it.',lessonId:'multiply',type:'application/pdf',filename:'page.pdf',data:'JVBERi0='};
test('local learner and homework schemas reject invalid references and dates',()=>{
 assert.deepEqual(validateLearner(learner),learner);
 for(const patch of [{id:undefined},{id:null},{name:''},{grade:'9'}])assert.throws(()=>validateLearner({...learner,...patch}));
 for(const patch of [{id:undefined},{learnerId:'other'},{date:'2026-02-30'},{status:'published'},{lessonId:'not-a-lesson'},{notes:{}},{type:'text/html'}])assert.throws(()=>validateWork({...work,...patch},[learner]));
 assert.ok(validDate('2024-02-29'));assert.ok(!validDate('2025-02-29'));assert.ok(!validDate(null));
});
test('family file validation rejects disguised HTML and bounds attachment size',()=>{
 assert.ok(validateFileBytes(new TextEncoder().encode('%PDF-test'),'application/pdf'));
 assert.throws(()=>validateFileBytes(new TextEncoder().encode('<html>'),'application/pdf'));
 assert.throws(()=>validateFileBytes(new Uint8Array(25*1024*1024+1),'image/png'));
 assert.throws(()=>validateFileBytes(new Uint8Array(),'image/png'));
 assert.throws(()=>validateFileBytes(new TextEncoder().encode('<svg/>'),'image/svg+xml'));
});
test('filename suggestions stay labelled, bounded and grade-specific',()=>{
 const suggestion=suggestHomework('2026-10-18_division_practice.pdf','3');
 assert.equal(suggestion.date,'2026-10-18');assert.equal(suggestHomework('math_2026-10-18_page.pdf','3').date,'2026-10-18');assert.equal(suggestion.lessonId,'divide');
 assert.match(suggestion.source,/not been read/);assert.equal(suggestHomework('holiday.jpg','K').lessonId,null);
 assert.equal(parentStrategy('5').length,3);
});
test('plans reject duplicate lessons and cross-grade lesson IDs',()=>{
 const plan={id:'plan-1',learnerId:learner.id,date:'2026-10-18',lessons:['multiply','divide']};
 assert.equal(validatePlan(plan,[learner]),plan);
 for(const lessons of [['multiply','multiply'],['subtract-fractions'],['starter','multiply','divide','other']])assert.throws(()=>validatePlan({...plan,lessons},[learner]));
});
test('restore preflight rejects malformed or duplicate records before writing',()=>{
 const base={version:1,learners:[learner],works:[work],plans:[]};assert.equal(parseBackup(base).works.length,1);
 for(const patch of [{version:2},{learners:[learner,learner]},{works:[work,work]},{works:[{...work,data:'<script>'}]},{works:[{...work,learnerId:'missing'}]}])assert.throws(()=>parseBackup({...base,...patch}));
});
