import test from 'node:test';
import assert from 'node:assert/strict';
import {checkDrawnShape,DRAWING_ACTIVITIES} from './drawingActivities.js';
import {buildTogetherTurns} from './guidedLesson.js';
const p=(...coords)=>coords.map(([x,y])=>({x,y}));
test('shape checking rejects open, flat, repeated and crossed shapes',()=>{
 assert.equal(checkDrawnShape(p([0,0],[2,0],[0,2]),'triangle',false).ok,false);
 assert.equal(checkDrawnShape(p([0,0],[1,1],[2,2]),'triangle',true).ok,false);
 assert.equal(checkDrawnShape(p([0,0],[0,0],[2,2]),'triangle',true).ok,false);
 assert.equal(checkDrawnShape(p([0,0],[2,2],[0,2],[2,0]),'square',true).ok,false);
 assert.equal(checkDrawnShape(p([0,0],[2,0],[1,1],[0,2]),'rectangle',true).ok,false);
});
test('triangles and rectangles work in either orientation; square requires equal sides',()=>{
 for(const points of [p([0,0],[4,0],[0,3]),p([0,3],[4,0],[0,0])])assert.equal(checkDrawnShape(points,'triangle',true).ok,true);
 const rectangle=p([0,0],[4,0],[4,2],[0,2]);
 assert.equal(checkDrawnShape(rectangle,'rectangle',true).ok,true);
 assert.equal(checkDrawnShape(rectangle,'square',true).ok,false);
 const rotated=p([2,0],[4,2],[2,4],[0,2]);
 assert.equal(checkDrawnShape(rotated,'square',true).ok,true);
 assert.equal(checkDrawnShape(rotated,'rectangle',true).ok,true);
 assert.equal(DRAWING_ACTIVITIES.length,6);
});
test('division coaching derives partial quotients from a verified final answer',()=>{
 const turns=buildTogetherTurns({prompt:'Each array? (800 ÷ 25)',correctAnswer:32});
 assert.deepEqual(turns.map(t=>t.answer),[750,50,2,32]);
 assert.ok(!turns[0].prompt.includes('32'));
 assert.deepEqual(buildTogetherTurns({prompt:'800 ÷ 25',correctAnswer:31}),[]);
 assert.deepEqual(buildTogetherTurns({prompt:'800 ÷ 0',correctAnswer:32}),[]);
 for(let divisor=1;divisor<=25;divisor++)for(let answer=10;answer<=60;answer++){
 const turns=buildTogetherTurns({prompt:`${divisor*answer} ÷ ${divisor}`,correctAnswer:answer});
 assert.equal(turns[0].answer+turns[1].answer,divisor*answer);
 assert.equal(turns[2].answer+Math.floor(answer/10)*10,answer);
 assert.equal(turns[3].answer,answer);
 }
});
