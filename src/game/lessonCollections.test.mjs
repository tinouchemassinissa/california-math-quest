import test from 'node:test';
import assert from 'node:assert/strict';
import {lessonCollections} from './lessonCollections.js';
import {journeyCatalog} from './learningJourney.js';
test('K–5 collections contain each existing checked lesson exactly once',()=>{
 for(const grade of ['K','1','2','3','4','5']){
  const collections=lessonCollections(grade),ids=collections.flatMap(c=>c.lessons.map(l=>l.id));
  assert.equal(new Set(ids).size,ids.length);
  assert.deepEqual([...ids].sort(),journeyCatalog(grade).map(l=>l.id).sort());
  assert.ok(collections.every(c=>c.title&&c.description&&c.lessons.length));
 }
 assert.throws(()=>lessonCollections('6'));
});
