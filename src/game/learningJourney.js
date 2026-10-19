import { Rational, lcm } from './mathEngine/rational.js';
import { isAnswerEquivalent, canonicalAnswer } from './mathEngine/answerMath.js';
import { verifyQuestion } from './mathEngine/verifier.js';

export const JOURNEY_VERSION = 1;
// Original, bounded mini-lessons. Selected subskills, not complete grade coverage.
export const JOURNEYS = {
  K:{title:'Put small groups together',standard:'K.OA.A.2',kind:'add',values:[[1,2],[2,2],[3,2],[4,1],[2,4],[3,4],[2,6],[1,6],[4,4],[1,1]]},
  '1':{title:'Make a ten to add',standard:'1.OA.C.6',kind:'add',values:[[8,3],[9,4],[8,5],[7,4],[9,6],[8,7],[6,7],[7,5],[9,8],[9,1]]},
  '2':{title:'Hundreds, tens and ones',standard:'2.NBT.A.1',kind:'place',values:[[2,3,4],[3,1,5],[1,2,3],[2,4,1],[4,2,3],[3,5,2],[5,3,1],[4,1,6],[6,2,4],[1,0,1]]},
  '3':{title:'Equal groups and fact families',standard:'3.OA.C.7',kind:'multiply',values:[[3,4],[4,5],[2,3],[3,6],[4,3],[5,6],[6,4],[7,3],[4,7],[2,2]]},
  '4':{title:'Add equal-sized fraction parts',standard:'4.NF.B.3',kind:'fraction',values:[[1,4,2,4],[2,8,3,8],[1,6,2,6],[2,10,3,10],[1,8,4,8],[2,6,3,6],[3,12,4,12],[1,5,2,5],[2,9,4,9],[1,4,1,4]]},
  '5':{title:'Rename fractions to add',standard:'5.NF.A.1',kind:'fraction',values:[[1,3,1,4],[1,2,1,6],[1,2,1,4],[1,3,1,6],[1,4,1,8],[1,2,1,3],[1,3,1,5],[1,4,1,6],[1,2,1,8],[1,2,1,2]]},
};
export const EXTRA_JOURNEYS = {
 K:[
  {id:'take-away',title:'Take away and count what remains',standard:'K.OA.A.2',kind:'subtract',values:[[5,2],[6,3],[4,1],[7,2],[8,3],[9,4],[6,2],[8,5],[7,3],[3,1]]},
  {id:'make-ten',title:'Find the missing part of ten',standard:'K.OA.A.4',kind:'missing',values:[[6,4],[8,2],[5,5],[7,3],[4,6],[9,1],[3,7],[2,8],[1,9],[5,5]]}],
 '1':[
  {id:'subtract',title:'Subtract by going through ten',standard:'1.OA.C.6',kind:'subtract',values:[[13,5],[14,6],[12,4],[15,7],[16,8],[17,9],[11,3],[18,9],[13,6],[11,2]]},
  {id:'missing-part',title:'Find a missing addition part',standard:'1.OA.D.8',kind:'missing',values:[[6,7],[8,5],[5,6],[7,8],[9,4],[6,9],[8,7],[4,9],[7,6],[3,4]]}],
 '2':[
  {id:'tens',title:'What is a tens digit worth?',standard:'2.NBT.A.1',kind:'place',focus:'tens'},
  {id:'hundreds',title:'What is a hundreds digit worth?',standard:'2.NBT.A.1',kind:'place',focus:'hundreds'}],
 '3':[
  {id:'multiply',title:'Build multiplication groups',standard:'3.OA.C.7',kind:'multiply',operation:'multiply'},
  {id:'divide',title:'Share into equal groups',standard:'3.OA.C.7',kind:'multiply',operation:'divide'}],
 '4':[
  {id:'subtract-fractions',title:'Subtract equal-sized fraction parts',standard:'4.NF.B.3',kind:'fraction',operation:'subtract',values:[[3,4,1,4],[5,8,2,8],[4,6,1,6],[7,10,3,10],[6,8,1,8],[5,6,2,6],[9,12,4,12],[4,5,1,5],[7,9,2,9],[2,4,1,4]]},
  {id:'fraction-sums',title:'Explore more fraction sums',standard:'4.NF.B.3',kind:'fraction',values:[[2,5,1,5],[3,8,4,8],[2,6,2,6],[1,10,6,10],[3,12,5,12],[2,9,5,9],[1,4,1,4],[4,10,3,10],[2,8,5,8],[1,3,1,3]]}],
 '5':[
  {id:'subtract-fractions',title:'Rename fractions to subtract',standard:'5.NF.A.1',kind:'fraction',operation:'subtract',values:[[3,4,1,2],[5,6,1,3],[1,2,1,4],[2,3,1,6],[7,8,1,4],[4,5,1,2],[5,6,1,4],[3,4,1,6],[7,10,1,5],[1,2,1,2]]},
  {id:'fraction-sums',title:'Explore more unlike fraction sums',standard:'5.NF.A.1',kind:'fraction',values:[[1,3,1,2],[1,4,1,5],[1,6,1,3],[1,5,1,10],[1,8,1,4],[2,5,1,4],[1,6,1,8],[1,3,1,9],[1,2,1,10],[1,4,1,4]]}],
};
const EXTRA_REVIEW={
 K:{starter:[[1,8],[2,7]],'take-away':[[10,2],[10,7]],'make-ten':[[0,10],[10,0]]},
 '1':{starter:[[6,5],[7,6]],subtract:[[12,7],[14,9]],'missing-part':[[2,9],[9,9]]},
 '2':{starter:[[2,0,7],[5,6,0]],tens:[[2,0,7],[5,6,0]],hundreds:[[2,0,7],[5,6,0]]},
 '3':{starter:[[8,4],[9,6]],multiply:[[8,4],[9,6]],divide:[[8,4],[9,6]]},
 '4':{starter:[[1,7,3,7],[2,11,5,11]],'subtract-fractions':[[6,7,2,7],[8,11,3,11]],'fraction-sums':[[2,7,4,7],[3,11,6,11]]},
 '5':{starter:[[1,5,1,6],[1,7,1,2]],'subtract-fractions':[[4,7,1,2],[5,8,1,3]],'fraction-sums':[[2,7,1,4],[3,8,1,6]]}
};
export function journeyCatalog(grade){
 const base=JOURNEYS[grade];if(!base)throw new RangeError('Unsupported grade');
 return [{...base,id:'starter'},...EXTRA_JOURNEYS[grade].map(item=>({...item,values:item.values||base.values}))].map(item=>({...item,values:[...item.values,...EXTRA_REVIEW[grade][item.id]]}));
}
export function journeyConfig(grade,lessonId='starter'){
 const config=journeyCatalog(grade).find(c=>c.id===lessonId);if(!config)throw new RangeError('Unsupported lesson');return config;
}
export function journeyQuestion(grade,index,lessonId="starter") {
  const config=journeyConfig(grade,lessonId);
  if(!config||!Number.isInteger(index)||index<0||index>=config.values.length)throw new RangeError('Unsupported journey item');
  const [a,b,c,d]=config.values[index];
  let prompt,answer,explanation,visual,pattern;
  if(config.kind==='subtract'){
    answer=a-b;prompt=`Start with ${a} counters. Take away ${b} counters. How many counters remain?`;
    explanation=grade==='1'?`Take away ${a-10} first to reach 10. There are ${b-(a-10)} more to take away. Then, 10 - ${b-(a-10)} = ${answer}.`:`Remove ${b} counters from ${a}. ${a} - ${b} = ${answer}.`;
    visual={type:'journey-subtract',a,b};pattern={answer:a+b,code:'operation-added',label:'Try taking away instead of joining'};
  }else if(config.kind==='missing'){
    answer=b;prompt=`Find the missing number: ${a} + ? = ${a+b}.`;
    explanation=`The whole is ${a+b}, and one part is ${a}. Find the other part: ${a+b} - ${a} = ${b}. Check: ${a} + ${b} = ${a+b}.`;
    visual={type:'journey-add',a,b,makeTen:false};pattern={answer:a+(a+b),code:'operation-added',label:'Use the whole and the known part'};
  }else if(config.kind==='add'){
    answer=a+b;prompt=`There ${a===1?"is":"are"} ${a} ${a===1?"counter":"counters"}. Add ${b} more ${b===1?"counter":"counters"}. How many counters are there in all?`;
    const makeTen=grade==='1';
    explanation=makeTen?`Split ${b} into ${10-a} and ${b-(10-a)}. First, ${a} + ${10-a} = 10. Then, 10 + ${b-(10-a)} = ${answer}.`:`Join the two groups. ${a} + ${b} = ${answer}. Count each counter once.`;
    visual={type:'journey-add',a,b,makeTen};pattern={answer:a,code:'first-group-only',label:'Try counting both groups'};
  }else if(config.kind==='place'){
    answer=100*a+10*b+c;prompt=`What number has ${a} ${a===1?"hundred":"hundreds"}, ${b} ${b===1?"ten":"tens"} and ${c} ${c===1?"one":"ones"}?`;
    explanation=`${a} ${a===1?"hundred is":"hundreds are"} ${100*a}. ${b} ${b===1?"ten is":"tens are"} ${10*b}. ${c} ${c===1?"one is":"ones are"} ${c}. Combine the values: ${100*a} + ${10*b} + ${c} = ${answer}.`;
    if(config.focus){const digit=config.focus==='tens'?b:a,value=config.focus==='tens'?10:100;
      prompt=`In ${100*a+10*b+c}, what is the value of the digit ${digit} in the ${config.focus} place?`;
      answer=digit*value;explanation=`The digit ${digit} is in the ${config.focus} place. Its value is ${digit} × ${value} = ${answer}.`;
    }
    visual={type:'journey-place',hundreds:a,tens:b,ones:c};pattern={answer:config.focus?(config.focus==='tens'?b:a):a+b+c,code:'digits-added',label:'Try the value of each place'};
  }else if(config.kind==='multiply'){
    const divide=config.operation==='divide'||(!config.operation&&index%2===1);answer=divide?b:a*b;
    prompt=divide?`What is ${a*b} ÷ ${a}?`:`What is ${a} × ${b}?`;
    explanation=divide?`Share ${a*b} counters into ${a} equal groups. Each group has ${b} counters. Check: ${a} × ${b} = ${a*b}.`:`Make ${a} groups with ${b} counters in each. ${a} × ${b} = ${a*b}.`;
    visual={type:'guided-groups',groups:a,each:b};pattern={answer:divide?a*b+a:a+b,code:'numbers-added',label:'Try equal groups instead of adding the two numbers'};
  }else{
    const subtract=config.operation==='subtract',sign=subtract?'-':'+';
    answer=new Rational(subtract?a*d-c*b:a*d+c*b,b*d).toString();prompt=`Both fractions refer to the same-sized whole. Calculate ${a}/${b} ${sign} ${c}/${d}.`;
    const denominator=lcm(b,d),left=a*(denominator/b),right=c*(denominator/d);
    explanation=`Rename the fractions as ${left}/${denominator} and ${right}/${denominator}. ${subtract?"Subtract":"Add"} the numerators and keep the size of each part: ${subtract?left-right:left+right}/${denominator} = ${answer}.`;
    visual={type:'guided-fractions',n1:a,d1:b,n2:c,d2:d,denominator,left,right,operation:sign};
    pattern={answer:new Rational(subtract?a-c:a+c,b+d).toString(),code:subtract?'denominators-subtracted':'denominators-added',label:'Try making the fraction pieces the same size'};
  }
  const candidates=[answer,pattern.answer,config.kind==='fraction'?'1':Number(answer)+1,config.kind==='fraction'?'0':Math.max(0,Number(answer)-1),config.kind==='fraction'?'2':Number(answer)+2,config.kind==='fraction'?'3':Number(answer)+3];
  const options=[...new Map(candidates.map(v=>[canonicalAnswer(v),v])).values()].slice(0,4);
  // Stable rotation prevents always putting the answer in the first position.
  for(let n=0;n<(index+Number(grade==='K'?0:grade))%4;n++)options.push(options.shift());
  const question={id:`journey-v${JOURNEY_VERSION}-${grade}-${lessonId}-${index}`,grade,standard:config.standard,title:config.title,prompt,correctAnswer:answer,options,explanation,hint:'Draw the quantities and explain what each part means.'};
  const checked=verifyQuestion(question);
  if(!checked.valid)throw new Error(`Journey item failed checks: ${checked.error}`);
  return {...question,lessonVisual:visual,pattern};
}
export function createJourney(grade,lessonId='starter'){journeyConfig(grade,lessonId);return {grade,lessonId,phase:'diagnostic',position:0,attempts:[],feedback:null,help:false};}
export function currentJourneyIndex(state){if(state.phase==='review'&&state.reviewSet===1)return 10+state.position;if(state.phase==='lesson'&&state.support)return 9;return {diagnostic:0,lesson:2,guided:3,check:5,review:7}[state.phase]+state.position;}
export function submitJourney(state,answer){
  if(state.feedback||!['diagnostic','guided','check','review'].includes(state.phase))return state;
  const question=journeyQuestion(state.grade,currentJourneyIndex(state),state.lessonId);
  if(!question.options.some(o=>isAnswerEquivalent(o,answer)))return state;
  const correct=isAnswerEquivalent(answer,question.correctAnswer);
  const pattern=!correct&&isAnswerEquivalent(answer,question.pattern.answer)?question.pattern.code:null;
  const attempt={item:question.id,phase:state.phase,answer,correct,assisted:state.help||state.phase==='guided',pattern};
  return {...state,attempts:[...state.attempts,attempt],feedback:attempt};
}
export function nextJourney(state){
  if(state.phase==='lesson')return {...state,phase:'guided',position:0,feedback:null,help:false};
  if(!state.feedback)return state;
  if(state.position===0)return {...state,position:1,feedback:null,help:false};
  const phase={diagnostic:'lesson',guided:'check',check:'complete',review:'complete'}[state.phase];
  const support=phase==='lesson'&&state.attempts.filter(a=>a.phase==='diagnostic'&&!a.correct).length>=2;
  return {...state,phase,position:0,feedback:null,help:false,support};
}
export function journeySummary(state,now=Date.now()){
  const checks=state.attempts.filter(a=>a.phase==='check'||a.phase==='review').slice(-2);
  const independent=checks.length===2&&checks.every(a=>a.correct&&!a.assisted);
  const counts={};for(const a of state.attempts)if(a.pattern)counts[a.pattern]=(counts[a.pattern]||0)+1;
  return {version:JOURNEY_VERSION,grade:state.grade,lessonId:state.lessonId||"starter",independent,reviewSet:state.reviewSet??0,checks:checks.length,patterns:Object.keys(counts).filter(k=>counts[k]>=2),completedAt:now,reviewAt:now+(independent?86400000:600000)};
}
export function journeyStorageKey(name,grade,lessonId="starter"){return `bip_journey_v${JOURNEY_VERSION}:${encodeURIComponent(String(name).trim().toLowerCase()||'guest')}:${grade}:${lessonId}`;}
export function readJourneyRecord(raw,grade,lessonId="starter"){try{const r=JSON.parse(raw);return r?.version===JOURNEY_VERSION&&r.grade===grade&&(r.lessonId||'starter')===lessonId&&typeof r.independent==='boolean'&&(r.reviewSet===undefined||r.reviewSet===0||r.reviewSet===1)&&Number.isFinite(r.reviewAt)&&Number.isFinite(r.completedAt)&&r.completedAt>=0&&r.reviewAt>=r.completedAt&&Number.isInteger(r.checks)&&r.checks>=0&&r.checks<=2&&Array.isArray(r.patterns)&&r.patterns.every(p=>['operation-added','denominators-subtracted','denominators-added','digits-added','numbers-added','first-group-only'].includes(p))?r:null;}catch{return null;}}

// Rebuild saved attempts through the same checked transitions; never trust saved scores.
export function journeyProgressKey(name,grade,lessonId='starter'){return journeyStorageKey(name,grade,lessonId)+':progress';}
export function readJourneyProgress(raw,grade,lessonId='starter'){
 try{
  if(typeof raw!=='string'||raw.length>20000)return null;
  const data=JSON.parse(raw),target=data.state;
  if(data.version!==JOURNEY_VERSION||!target||target.grade!==grade||target.lessonId!==lessonId||target.phase==='complete'||typeof target.help!=='boolean'||!Array.isArray(target.attempts)||target.attempts.length>8)return null;
  let state=createJourney(grade,lessonId);
  if(target.reviewSet!==undefined&&target.reviewSet!==0&&target.reviewSet!==1)return null;
  if(target.phase==='review'||target.attempts[0]?.phase==='review')state={...state,phase:'review',...(target.reviewSet===undefined?{}:{reviewSet:target.reviewSet})};
  for(const attempt of target.attempts){
   if(state.feedback)state=nextJourney(state);
   if(state.phase==='lesson')state=nextJourney(state);
   if(attempt.phase!==state.phase||typeof attempt.assisted!=='boolean')return null;
   state={...state,help:attempt.assisted&&state.phase!=='guided'};
   state=submitJourney(state,attempt.answer);
   if(JSON.stringify(state.feedback)!==JSON.stringify(attempt))return null;
  }
  if(!target.feedback&&state.feedback)state=nextJourney(state);
  // A worked example may have been completed before leaving.
  if(state.phase==='lesson'&&target.phase==='guided')state=nextJourney(state);
  if(state.phase!==target.phase||state.position!==target.position||Boolean(state.feedback)!==Boolean(target.feedback))return null;
  if(target.feedback&&JSON.stringify(state.feedback)!==JSON.stringify(target.feedback))return null;
  if(state.help&&!target.help)return null;
  return {...state,help:target.help};
 }catch{return null;}
}
