export const DRAWING_ACTIVITIES = [
 {id:'shade',label:'Shade a fraction',steps:['Notice the equal parts in one whole.','Shade the number of parts in the numerator.','Check your fraction.']},
 {id:'counters',label:'Move and share counters',steps:['Find all the counters in the tray.','Share them across the groups.','Compare the groups and check.']},
 {id:'symmetry',label:'Make a mirror picture',steps:['Find the mirror line.','Match each square on the opposite side.','Check distances from the mirror line.']},
 {id:'area',label:'Explore area and perimeter',steps:['Cover the inside with unit squares.','Count unit edges around the outside.','Check the area and perimeter.']},
 {id:'triangle',label:'Build a triangle',steps:['Choose three corners that do not lie on one straight line.','Join the corners by closing your shape.','Check: three straight sides and three corners.']},
 {id:'rectangle',label:'Build a rectangle',steps:['Choose four corners in order around your shape.','Close the shape. Look for four square corners.','Check: opposite sides are equal and all four angles are right angles. A square also counts!']},
 {id:'square',label:'Build a square',steps:['Choose four corners in order.','Close the shape. Make all four sides equal.','Check: four equal sides and four right angles.']},
 {id:'groups',label:'Draw equal groups',steps:['Draw 3 circles for groups.','Put 4 dots in every circle.','Count your dots. Check that every circle has the same number.']},
 {id:'fraction',label:'Show one half',steps:['Draw a rectangle for one whole.','Split it into two equal-sized parts.','Shade one part. Check: are both parts the same size?']},
 {id:'line',label:'Jump on a number line',steps:['Draw a line from 0 to 10 with equal spaces.','Start at 2. Draw 3 jumps of one space to the right.','Label your landing point. Count jumps, not tick marks.']},
];
export function checkDrawnShape(points,kind,closed) {
 if(!closed)return {ok:false,message:'Close your shape first. Join the last corner back to the first.'};
 const wanted=kind==='triangle'?3:4;
 if(points.length!==wanted)return {ok:false,message:`This challenge needs ${wanted} corners. Undo a corner or start again.`};
 if(points.some((p,i)=>points.some((q,j)=>j<i&&p.x===q.x&&p.y===q.y)))return {ok:false,message:'Choose a different spot for each corner.'};
 const cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
 const area=points.reduce((sum,p,i)=>{const q=points[(i+1)%points.length];return sum+p.x*q.y-q.x*p.y;},0);
 if(!area)return {ok:false,message:'Your shape is flat. Move a corner off the line.'};
 if(kind==='triangle')return {ok:true,message:'You built a triangle: three straight sides and three corners!'};
 const turns=points.map((p,i)=>cross(p,points[(i+1)%4],points[(i+2)%4]));
 if(turns.some(v=>v===0)||!turns.every(v=>Math.sign(v)===Math.sign(turns[0])))return {ok:false,message:'Go around the outside in order. Keep the sides from crossing.'};
 const edges=points.map((p,i)=>({x:points[(i+1)%4].x-p.x,y:points[(i+1)%4].y-p.y}));
 if(!edges.every((e,i)=>e.x*edges[(i+1)%4].x+e.y*edges[(i+1)%4].y===0))return {ok:false,message:'Look at each corner. A rectangle or square needs four right angles, like the corner of a page.'};
 const lengths=edges.map(e=>e.x*e.x+e.y*e.y);
 if(kind==='square'&&!lengths.every(v=>v===lengths[0]))return {ok:false,message:'Your right angles work! Now make all four sides the same length.'};
 return {ok:true,message:kind==='square'?'You built a square: four equal sides and four right angles!':'You built a rectangle: four right angles and equal opposite sides!'};
}
