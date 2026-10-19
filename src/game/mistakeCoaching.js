// Checked lesson quantities drive every step; no model invents arithmetic.
export function mistakeCoaching(question,config,grade){
 const v=question.lessonVisual;let steps;
 if(config.kind==='fraction')steps=[
  {title:'Make the pieces the same size',text:`Use the same-sized whole for both fractions. Divide each whole into ${v.denominator} equal parts.`},
  {title:'Rename, then work with the parts',text:`${v.n1}/${v.d1} is ${v.left}/${v.denominator}, and ${v.n2}/${v.d2} is ${v.right}/${v.denominator}. ${v.operation==='-'?'Take away':'Combine'} the shaded parts. Keep the denominator ${v.denominator}.`}
 ];
 else if(config.kind==='multiply')steps=question.prompt.includes('÷')?[
  {title:'Start with the whole group',text:`There are ${v.groups*v.each} counters. Share them into ${v.groups} equal groups.`},
  {title:'Share fairly',text:'Give each group one counter at a time. Count how many counters end up in one group.'}
 ]:[
  {title:'Build equal groups',text:`Make ${v.groups} groups. Put ${v.each} counters in every group.`},
  {title:'Count every group',text:`Count by ${v.each}, once for each group. The picture shows all ${v.groups} groups.`}
 ];
 else if(config.kind==='place')steps=[
  {title:'Find the place',text:config.focus?`Find the ${config.focus} column. The digit tells us how many ${config.focus} there are.`:'Read the hundreds, tens and ones columns separately.'},
  {title:'Give the digit its value',text:config.focus?`Each block in this column is worth ${config.focus==='tens'?10:100}. Multiply the number of blocks by that value.`:`Each hundred is 100, each ten is 10, and each one is 1. Add the values of the blocks.`}
 ];
 else if(config.kind==='subtract')steps=[
  {title:'Start with what you have',text:`Count the ${v.a} counters in the picture.`},
  {title:'Take away, then count',text:grade==='1'?`Take away ${v.a-10} to reach 10. Then take away ${v.b-(v.a-10)} more. Count what remains.`:`Cross out ${v.b} counters. Count only the counters that are left.`}
 ];
 else if(config.kind==='missing')steps=[
  {title:'Find the whole and the known part',text:`The whole is ${v.a+v.b}. The part we already know is ${v.a}.`},
  {title:'Look for the missing part',text:`Start at ${v.a} and count up to ${v.a+v.b}. How many more do you need?`}
 ];
 else steps=[
  {title:'Look at the two groups',text:`Start with ${v.a} counters. We are adding ${v.b} more.`},
  {title:grade==='1'?'Make a ten':'Join the groups',text:grade==='1'?`Move ${10-v.a} counters from the second group to fill ten. Then count the counters left over.`:'Count every counter in both groups once. You can point to each one as you count.'}
 ];
 return [...steps,{title:'Put it together',text:question.explanation}];
}
