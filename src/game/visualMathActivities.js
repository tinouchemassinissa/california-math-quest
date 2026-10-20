import {isAnswerEquivalent} from './mathEngine/answerMath.js';
export const SYMMETRY_LEFT=[[0,0],[1,0],[1,1],[2,2],[0,3]];
export const mirrorCell=([x,y])=>[5-x,y];
export const cellKey=([x,y])=>x+','+y;
export function matchesCells(selected,expected) {
 const keys=expected.map(cellKey);
 return selected.length===keys.length&&new Set(selected).size===keys.length&&keys.every(k=>selected.includes(k));
}
export function checkFractionShade(selected) {
 return selected.length===3&&new Set(selected).size===3&&selected.every(k=>/^[0-3],[01]$/.test(k))?{ok:true,message:'Yes! Three of eight equal parts are shaded: 3/8.'}:{ok:false,message:'Count the shaded parts. The numerator tells how many to shade. Keep all eight equal parts.'};
}
export function checkCounterGroups(positions) {
 if(positions.length!==12||positions.some(p=>!Number.isInteger(p)||p<0||p>2))return {ok:false,message:'Move every counter from the tray into a group first.'};
 const counts=[0,1,2].map(g=>positions.filter(p=>p===g).length);
 return counts.every(c=>c===4)?{ok:true,message:'You shared 12 counters equally: 3 groups of 4!'}:{ok:false,message:'Compare the groups. Move a counter from a larger group to a smaller one until they match.'};
}
export function checkSymmetry(selected) {
 return matchesCells(selected,SYMMETRY_LEFT.map(mirrorCell))?{ok:true,message:'Your picture is symmetric! Each matching square is the same distance from the mirror line.'}:{ok:false,message:'Look across the mirror line, one row at a time. A square close to the line needs a match just as close on the other side.'};
}
export const AREA_CELLS=Array.from({length:12},(_,i)=>[1+i%4,1+Math.floor(i/4)]);
export function checkAreaModel(selected,perimeter) {
 if(!matchesCells(selected,AREA_CELLS))return {ok:false,message:'Cover only the inside of the outlined rectangle. Count rows and columns; leave no gaps.'};
 if(!isAnswerEquivalent(perimeter,14))return {ok:false,message:'Your area tiles fit! For perimeter, count unit edges around the outside. Include all four sides.'};
 return {ok:true,message:'You found both: area is 12 square units; perimeter is 14 units. Area covers the inside; perimeter measures the boundary.'};
}
