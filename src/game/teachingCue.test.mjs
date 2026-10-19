import test from 'node:test';
import assert from 'node:assert/strict';
import {teachingCue} from './teachingCue.js';
import {journeyCatalog} from './learningJourney.js';
test('every lesson receives a cue for its own representation',()=>{
 for(const grade of ['K','1','2','3','4','5'])for(const lesson of journeyCatalog(grade)){
  const cue=teachingCue(lesson,grade);assert.ok(cue.text.length>20);assert.ok(cue.focus);
  if(lesson.kind==='place')assert.match(cue.text,/column/);
  if(lesson.kind==='fraction')assert.match(cue.text,/whole/);
 }
 assert.match(teachingCue({kind:'add'},'K',{correct:false,pattern:'first-group-only'}).text,/both groups/);
 assert.match(teachingCue({kind:'subtract'},'K',{correct:false,pattern:'operation-added'}).text,/takes counters away/);
});
