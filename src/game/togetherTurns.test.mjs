import test from 'node:test';
import assert from 'node:assert/strict';
import {buildTogetherTurns,scratchpadPrompt} from './guidedLesson.js';
test('coordinate coaching asks across and up separately before combining them',()=>{
 for(let x=0;x<=10;x++)for(let y=0;y<=10;y++){
 const q={manipulative:{type:'coordinate',x,y}};
 const turns=buildTogetherTurns(q);
 assert.deepEqual(turns.map(t=>t.answer),[x,y,`(${x}, ${y})`]);
 assert.ok(!turns[0].prompt.includes(`(${x}, ${y})`));
 assert.match(scratchpadPrompt(q),/across/);
 }
 assert.deepEqual(buildTogetherTurns({manipulative:{type:'coordinate',x:NaN,y:2}}),[]);
 assert.deepEqual(buildTogetherTurns({}),[]);
 assert.match(scratchpadPrompt({standard:'5.NF.A.1'}),/same-sized/);
});
