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
export function journeyQuestion(grade,index) {
  const config=JOURNEYS[grade];
  if(!config||!Number.isInteger(index)||index<0||index>=config.values.length)throw new RangeError('Unsupported journey item');
  const [a,b,c,d]=config.values[index];
  let prompt,answer,explanation,visual,pattern;
  if(config.kind==='add'){
    answer=a+b;prompt=`There ${a===1?"is":"are"} ${a} ${a===1?"counter":"counters"}. Add ${b} more ${b===1?"counter":"counters"}. How many counters are there in all?`;
    const makeTen=grade==='1';
    explanation=makeTen?`Split ${b} into ${10-a} and ${b-(10-a)}. First, ${a} + ${10-a} = 10. Then, 10 + ${b-(10-a)} = ${answer}.`:`Join the two groups. ${a} + ${b} = ${answer}. Count each counter once.`;
    visual={type:'journey-add',a,b,makeTen};pattern={answer:a,code:'first-group-only',label:'Try counting both groups'};
  }else if(config.kind==='place'){
    answer=100*a+10*b+c;prompt=`What number has ${a} ${a===1?"hundred":"hundreds"}, ${b} ${b===1?"ten":"tens"} and ${c} ${c===1?"one":"ones"}?`;
    explanation=`${a} ${a===1?"hundred is":"hundreds are"} ${100*a}. ${b} ${b===1?"ten is":"tens are"} ${10*b}. ${c} ${c===1?"one is":"ones are"} ${c}. Combine the values: ${100*a} + ${10*b} + ${c} = ${answer}.`;
    visual={type:'journey-place',hundreds:a,tens:b,ones:c};pattern={answer:a+b+c,code:'digits-added',label:'Try the value of each place'};
  }else if(config.kind==='multiply'){
    const divide=index%2===1;answer=divide?b:a*b;
    prompt=divide?`What is ${a*b} ÷ ${a}?`:`What is ${a} × ${b}?`;
    explanation=divide?`Share ${a*b} counters into ${a} equal groups. Each group has ${b} counters. Check: ${a} × ${b} = ${a*b}.`:`Make ${a} groups with ${b} counters in each. ${a} × ${b} = ${a*b}.`;
    visual={type:'guided-groups',groups:a,each:b};pattern={answer:divide?a*b+a:a+b,code:'numbers-added',label:'Try equal groups instead of adding the two numbers'};
  }else{
    answer=new Rational(a*d+c*b,b*d).toString();prompt=`Both fractions refer to the same-sized whole. Calculate ${a}/${b} + ${c}/${d}.`;
    const denominator=lcm(b,d),left=a*(denominator/b),right=c*(denominator/d);
    explanation=`Rename the fractions as ${left}/${denominator} and ${right}/${denominator}. Add the numerators and keep the size of each part: ${left+right}/${denominator} = ${answer}.`;
    visual={type:'guided-fractions',n1:a,d1:b,n2:c,d2:d,denominator,left,right,operation:'+'};
    pattern={answer:new Rational(a+c,b+d).toString(),code:'denominators-added',label:'Try making the fraction pieces the same size'};
  }
  const candidates=[answer,pattern.answer,config.kind==='fraction'?'1':Number(answer)+1,config.kind==='fraction'?'0':Math.max(0,Number(answer)-1),config.kind==='fraction'?'2':Number(answer)+2,config.kind==='fraction'?'3':Number(answer)+3];
  const options=[...new Map(candidates.map(v=>[canonicalAnswer(v),v])).values()].slice(0,4);
  // Stable rotation prevents always putting the answer in the first position.
  for(let n=0;n<(index+Number(grade==='K'?0:grade))%4;n++)options.push(options.shift());
  const question={id:`journey-v${JOURNEY_VERSION}-${grade}-${index}`,grade,standard:config.standard,title:config.title,prompt,correctAnswer:answer,options,explanation,hint:'Draw the quantities and explain what each part means.'};
  const checked=verifyQuestion(question);
  if(!checked.valid)throw new Error(`Journey item failed checks: ${checked.error}`);
  return {...question,lessonVisual:visual,pattern};
}
export function createJourney(grade){if(!JOURNEYS[grade])throw new RangeError('Unsupported grade');return {grade,phase:'diagnostic',position:0,attempts:[],feedback:null,help:false};}
export function currentJourneyIndex(state){if(state.phase==='lesson'&&state.support)return 9;return {diagnostic:0,lesson:2,guided:3,check:5,review:7}[state.phase]+state.position;}
export function submitJourney(state,answer){
  if(state.feedback||!['diagnostic','guided','check','review'].includes(state.phase))return state;
  const question=journeyQuestion(state.grade,currentJourneyIndex(state));
  if(!question.options.some(o=>isAnswerEquivalent(o,answer)))return state;
  const correct=isAnswerEquivalent(answer,question.correctAnswer);
  const pattern=!correct&&isAnswerEquivalent(answer,question.pattern.answer)?question.pattern.code:null;
  const attempt={item:question.id,phase:state.phase,correct,assisted:state.help||state.phase==='guided',pattern};
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
  return {version:JOURNEY_VERSION,grade:state.grade,independent,checks:checks.length,patterns:Object.keys(counts).filter(k=>counts[k]>=2),completedAt:now,reviewAt:now+(independent?86400000:600000)};
}
export function journeyStorageKey(name,grade){return `bip_journey_v${JOURNEY_VERSION}:${encodeURIComponent(String(name).trim().toLowerCase()||'guest')}:${grade}`;}
export function readJourneyRecord(raw,grade){try{const r=JSON.parse(raw);return r?.version===JOURNEY_VERSION&&r.grade===grade&&typeof r.independent==='boolean'&&Number.isFinite(r.reviewAt)&&Number.isFinite(r.completedAt)&&r.completedAt>=0&&r.reviewAt>=r.completedAt&&Number.isInteger(r.checks)&&r.checks>=0&&r.checks<=2&&Array.isArray(r.patterns)&&r.patterns.every(p=>['denominators-added','digits-added','numbers-added','first-group-only'].includes(p))?r:null;}catch{return null;}}
