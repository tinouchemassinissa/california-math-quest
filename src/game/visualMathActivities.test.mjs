import test from 'node:test';
import assert from 'node:assert/strict';
import {SYMMETRY_LEFT,mirrorCell,cellKey,AREA_CELLS,checkFractionShade,checkCounterGroups,checkSymmetry,checkAreaModel} from './visualMathActivities.js';
test('fraction shading checks three distinct equal parts of eight',()=>{
 assert.equal(checkFractionShade(['0,0','1,0','2,1']).ok,true);
 for(const cells of [[],['0,0'],['0,0','0,0','1,0'],['0,0','1,0','9,0']])assert.equal(checkFractionShade(cells).ok,false);
});
test('counter checking requires all twelve counters and equal groups',()=>{
 assert.equal(checkCounterGroups(Array.from({length:12},(_,i)=>i%3)).ok,true);
 for(const positions of [[],Array(12).fill(-1),Array(12).fill(0),[...Array(11).fill(0),3]])assert.equal(checkCounterGroups(positions).ok,false);
});
test('reflection across the vertical mirror requires each exact reflected cell',()=>{
 const expected=SYMMETRY_LEFT.map(mirrorCell).map(cellKey);
 assert.equal(checkSymmetry(expected).ok,true);assert.equal(checkSymmetry(expected.slice(1)).ok,false);
 assert.equal(checkSymmetry([...expected,'4,3']).ok,false);
 for(const p of SYMMETRY_LEFT)assert.deepEqual(mirrorCell(mirrorCell(p)),p);
});
test('area covers exactly twelve interior cells; perimeter measures fourteen edges',()=>{
 const tiles=AREA_CELLS.map(cellKey);
 assert.equal(new Set(tiles).size,12);assert.equal(checkAreaModel(tiles,14).ok,true);
 assert.equal(checkAreaModel(tiles,'14.0').ok,true);
 assert.equal(checkAreaModel(tiles,12).ok,false);
 assert.equal(checkAreaModel(tiles.slice(1),14).ok,false);
 assert.equal(checkAreaModel([...tiles,'0,0'],14).ok,false);
});
