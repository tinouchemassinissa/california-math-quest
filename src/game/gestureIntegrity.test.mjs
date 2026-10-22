import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {BIP_IDLE_CLIP,BIP_WAVE_CLIP,bipLessonReaction} from './bipLessonReaction.js';
test('runtime gesture references resolve to the exact validated v3 media',()=>{
 const root=new URL('../../public/bip/',import.meta.url);
 const report=JSON.parse(readFileSync(new URL('gestures-v3/validation.json',root),'utf8'));
 assert.equal(report.takes.length,12);assert.equal(report.fps,60);assert.equal(report.audio,false);
 const files=new Set();
 for(const take of report.takes){
  const path='gestures-v3/'+take.file,bytes=readFileSync(new URL(path,root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),take.sha256);
  assert.equal(bytes.length,take.bytes);files.add(path);
 }
 assert.ok(files.has(BIP_IDLE_CLIP));assert.ok(files.has(BIP_WAVE_CLIP));
 for(const state of [{phase:'diagnostic'},{phase:'lesson'},{phase:'rest'},{phase:'complete'},{feedback:{correct:true}},{feedback:{correct:false}}])assert.ok(files.has(bipLessonReaction(state).clip));
});
