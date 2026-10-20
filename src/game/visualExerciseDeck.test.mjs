import test from 'node:test';
import assert from 'node:assert/strict';
import {VISUAL_EXERCISES,fractionLayout,rectangleCells,boundaryEdges,mirrorCell,cellKey,checkFractionShade,checkCounterGroups,checkSymmetry,checkAreaModel} from './visualMathActivities.js';
test('every fraction exercise has equal grid parts and accepts exactly its numerator',()=>{
 for(const q of VISUAL_EXERCISES.shade){
 const {rows,cols}=fractionLayout(q.denominator);assert.equal(rows*cols,q.denominator);
 const keys=Array.from({length:q.numerator},(_,i)=>cellKey([i%cols,Math.floor(i/cols)]));
 assert.equal(checkFractionShade(keys,q).ok,true);
 assert.equal(checkFractionShade(keys.slice(1),q).ok,false);
 assert.equal(checkFractionShade([...keys,'99,99'],q).ok,false);
 }
});
test('every sharing task divides exactly; missing or unequal counters are rejected',()=>{
 for(const q of VISUAL_EXERCISES.counters){
 assert.equal(q.total%q.groups,0);
 const positions=Array.from({length:q.total},(_,i)=>i%q.groups);
 assert.equal(checkCounterGroups(positions,q).ok,true);
 const missing=[...positions];missing[0]=-1;assert.equal(checkCounterGroups(missing,q).ok,false);
 const unequal=[...positions];unequal[0]=1;assert.equal(checkCounterGroups(unequal,q).ok,false);
 }
});
test('all mirror patterns are unique, bounded and reflected onto the right half',()=>{
 for(const q of VISUAL_EXERCISES.symmetry){
 assert.equal(new Set(q.pattern.map(cellKey)).size,q.pattern.length);
 assert.ok(q.pattern.every(([x,y])=>x>=0&&x<3&&y>=0&&y<4));
 const right=q.pattern.map(mirrorCell).map(cellKey);
 assert.equal(checkSymmetry(right,q).ok,true);assert.equal(checkSymmetry(right.slice(1),q).ok,false);
 }
});
test('every area and boundary exercise agrees with independent grid edge counting',()=>{
 for(const q of VISUAL_EXERCISES.area){
 const cells=rectangleCells(q.width,q.height),set=new Set(cells.map(cellKey));
 let exposed=0;for(const [x,y] of cells)for(const [dx,dy] of [[0,1],[0,-1],[1,0],[-1,0]])if(!set.has(cellKey([x+dx,y+dy])))exposed++;
 const edges=boundaryEdges(q.width,q.height);assert.equal(edges.length,exposed);assert.equal(new Set(edges.map(e=>e.id)).size,exposed);
 assert.equal(cells.length,q.width*q.height);
 assert.equal(checkAreaModel([...set],exposed,q).ok,true);
 assert.equal(checkAreaModel([...set],exposed+1,q).ok,false);
 }
 assert.equal(checkAreaModel(rectangleCells(4,3).map(cellKey),18).ok,false);
});
