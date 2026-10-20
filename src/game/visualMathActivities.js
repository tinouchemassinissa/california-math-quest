import {isAnswerEquivalent} from './mathEngine/answerMath.js';
export const SYMMETRY_LEFT=[[0,0],[1,0],[1,1],[2,2],[0,3]];
export const mirrorCell=([x,y])=>[5-x,y];
export const cellKey=([x,y])=>x+','+y;
export const fractionLayout=d=>d>4&&d%2===0?{rows:2,cols:d/2}:{rows:1,cols:d};
export const rectangleCells=(w,h)=>Array.from({length:w*h},(_,i)=>[1+i%w,1+Math.floor(i/w)]);
export const AREA_CELLS=rectangleCells(4,3);
export const VISUAL_EXERCISES={
 shade:[[3,8],[1,2],[2,3],[3,4],[2,6],[5,8]].map(([numerator,denominator])=>({numerator,denominator})),
 counters:[[12,3],[6,2],[8,4],[10,2],[15,3],[20,4]].map(([total,groups])=>({total,groups})),
 symmetry:[SYMMETRY_LEFT,[[2,0],[1,1],[0,2],[2,3]],[[0,0],[2,0],[1,2],[2,2]],[[1,0],[1,1],[1,2],[0,3],[2,3]],[[0,1],[1,1],[2,1]],[[0,0],[0,1],[1,2],[2,3]]].map(pattern=>({pattern})),
 area:[[4,3],[2,2],[3,2],[4,2],[1,3],[3,3]].map(([width,height])=>({width,height})),
};
export function matchesCells(selected,expected) {
 const keys=expected.map(cellKey);
 return selected.length===keys.length&&new Set(selected).size===keys.length&&keys.every(k=>selected.includes(k));
}
export function checkFractionShade(selected,q=VISUAL_EXERCISES.shade[0]) {
 const {rows,cols}=fractionLayout(q.denominator);
 const valid=Array.from({length:rows*cols},(_,i)=>cellKey([i%cols,Math.floor(i/cols)]));
 return selected.length===q.numerator&&new Set(selected).size===q.numerator&&selected.every(k=>valid.includes(k))?{ok:true,message:`Yes! ${q.numerator} of ${q.denominator} equal parts are shaded: ${q.numerator}/${q.denominator}.`}:{ok:false,message:'Count the shaded parts. The numerator tells how many to shade. Keep the equal parts of the whole the same size.'};
}
export function checkCounterGroups(positions,q=VISUAL_EXERCISES.counters[0]) {
 if(positions.length!==q.total||positions.some(p=>!Number.isInteger(p)||p<0||p>=q.groups))return {ok:false,message:'Move every counter from the tray into a group first.'};
 const counts=Array.from({length:q.groups},(_,g)=>positions.filter(p=>p===g).length);
 return counts.every(c=>c===q.total/q.groups)?{ok:true,message:`You shared ${q.total} counters equally: ${q.groups} groups of ${q.total/q.groups}!`}:{ok:false,message:'Compare the groups. Move a counter from a larger group to a smaller one until they match.'};
}
export function checkSymmetry(selected,q=VISUAL_EXERCISES.symmetry[0]) {
 return matchesCells(selected,q.pattern.map(mirrorCell))?{ok:true,message:'Your picture is symmetric! Each matching square is the same distance from the mirror line.'}:{ok:false,message:'Look across the mirror line, one row at a time. A square close to the line needs a match just as close on the other side.'};
}
export function boundaryEdges(w,h) {
 const edges=[];
 for(let x=0;x<w;x++){edges.push({id:'top-'+x,x:1+x,y:1,horizontal:true});edges.push({id:'bottom-'+x,x:1+x,y:1+h,horizontal:true});}
 for(let y=0;y<h;y++){edges.push({id:'left-'+y,x:1,y:1+y,horizontal:false});edges.push({id:'right-'+y,x:1+w,y:1+y,horizontal:false});}
 return edges;
}
export function checkAreaModel(selected,perimeter,q=VISUAL_EXERCISES.area[0]) {
 if(!matchesCells(selected,rectangleCells(q.width,q.height)))return {ok:false,message:'Cover only the inside of the outlined rectangle. Count rows and columns; leave no gaps.'};
 if(!isAnswerEquivalent(perimeter,2*(q.width+q.height)))return {ok:false,field:'perimeter',message:'Your area tiles fit! For perimeter, count unit edges around the outside. Include all four sides. Try the edge-counting helper.'};
 return {ok:true,message:`You found both: area is ${q.width*q.height} square units; perimeter is ${2*(q.width+q.height)} units. Area covers the inside; perimeter measures the boundary.`};
}
