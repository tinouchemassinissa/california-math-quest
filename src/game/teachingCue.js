// Cues refer to visible quantities; they never identify a child or infer ability.
export function teachingCue(config,grade,feedback){
 const mistaken=feedback&&!feedback.correct?feedback.pattern:null;
 const kind=config.kind;
 const cue=kind==='subtract'?{focus:'remaining',text:'Cross out the counters taken away. Count only the counters left.'}
 :kind==='missing'?{focus:'parts',text:'Find the whole and the known part. What part is missing?'}
 :kind==='place'?{focus:config.focus||'places',text:config.focus?`Look at the ${config.focus} column. What is each block worth?`:'Read each column: hundreds, tens, then ones. Each block has a place value.'}
 :kind==='multiply'?{focus:'groups',text:'Count the groups, then the objects in each group. Every group must be equal.'}
 :kind==='fraction'?{focus:'pieces',text:'Look at both bars. Each small piece must represent the same fraction of the same-sized whole.'}
 :grade==='1'?{focus:'ten',text:'Fill the ten-frame first. Then count the counters left over.'}
 :{focus:'parts',text:'Look at both groups. Count each counter once.'};
 const prompts={
  'operation-added':kind==='missing'?'Adding the part to the whole makes a bigger number. Find the missing part instead.':'Adding joins counters. This problem takes counters away.',
  'first-group-only':'That counts one group. We need the counters in both groups.',
  'digits-added':'A digit and its value are different. Look at the column labels.',
  'numbers-added':'Adding the two numbers does not describe these equal groups.',
  'denominators-added':'The denominator names the size of the pieces. Keep equal-sized pieces when combining them.',
  'denominators-subtracted':'Removing pieces does not change their size. Keep the denominator after renaming.'
 };
 return {...cue,text:prompts[mistaken]?prompts[mistaken]+' '+cue.text:cue.text};
}
