import React,{useEffect,useState} from 'react';
import { JOURNEYS,createJourney,currentJourneyIndex,journeyQuestion,submitJourney,nextJourney,journeySummary,journeyStorageKey,readJourneyRecord } from '../game/learningJourney.js';
import VisualManipulative from './manipulatives/VisualManipulative.jsx';

function JourneyPicture({visual}){
  if(visual.type==='journey-add'&&visual.makeTen){
    const total=visual.a+visual.b;
    return <div className="journey-picture" role="img" aria-label={`${visual.a} counters joined with ${visual.b} counters, regrouped as ten and ${total-10} more`}><p>Fill a ten, then count the counters left over.</p><div className="journey-ten-frame">{Array.from({length:10},(_,i)=><span key={i} className={`journey-counter color-${i<visual.a?0:1}`}/>)}</div><p>Left over: {total-10}</p><div className="journey-counter-row">{Array.from({length:total-10},(_,i)=><span className="journey-counter color-1" key={i}/>)}</div></div>;
  }
  if(visual.type==='journey-add')return <div className="journey-picture" role="img" aria-label={`Two groups: ${visual.a} counters and ${visual.b} counters`}>
    <p>Count both groups{visual.makeTen?' and look for a group of ten':''}.</p>
    {[visual.a,visual.b].map((n,row)=><div className="journey-counter-row" key={row}><span>Group {row+1}</span>{Array.from({length:n},(_,i)=><span className={`journey-counter color-${row}`} key={i}/>)}</div>)}
  </div>;
  if(visual.type==='journey-place')return <div className="journey-places">{[['hundreds',100],['tens',10],['ones',1]].map(([place,value])=><div key={place}><strong>{place}</strong><div>{Array.from({length:visual[place]},(_,i)=><span key={i} className={`journey-place-block ${place}`}>{value}</span>)}</div></div>)}</div>;
  return <VisualManipulative manipulative={visual}/>;
}
const PHASES={diagnostic:'Let’s find a starting point',lesson:'Look, draw and explain',guided:'Practice with Bip',check:'Try on your own',review:'Remember it later',complete:'Your learning snapshot'};
export default function LearningJourney({grade,studentName,onClose}){
  const [state,setState]=useState(()=>createJourney(grade));
  const [record,setRecord]=useState(()=>{try{return readJourneyRecord(localStorage.getItem(journeyStorageKey(studentName,grade)),grade);}catch{return null;}});
  const [storageWarning,setStorageWarning]=useState(false);
  const [strategy,setStrategy]=useState(null);
  const [now,setNow]=useState(Date.now());
  const config=JOURNEYS[grade];
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{
    if(state.phase!=='complete')return;
    const result=journeySummary(state);
    setRecord(result);setNow(Date.now());
    try{localStorage.setItem(journeyStorageKey(studentName,grade),JSON.stringify(result));}catch{setStorageWarning(true);}
  },[state,studentName,grade]);
  const question=state.phase==='complete'?null:journeyQuestion(grade,currentJourneyIndex(state));
  const showPicture=state.phase==='lesson'||state.phase==='guided'||state.help;
  const isLesson=state.phase==='lesson';
  const strategyText=config.kind==='fraction'?'Use equal-sized pieces from the same-sized whole':config.kind==='place'?'Use the value of each digit’s place':config.kind==='multiply'?'Use equal groups and check the related fact':grade==='1'?'Make a ten, then add the counters left over':'Join the groups and count every counter once';
  const otherStrategy=config.kind==='fraction'?'Add the numerators and add the denominators':config.kind==='place'?'Add the digits without using their places':config.kind==='multiply'?'Always add the two numbers in the question':grade==='1'?'Count only the counters needed to fill ten':'Count only the first group';
  const strategies=[{text:strategyText,correct:true},{text:otherStrategy,correct:false}];
  if(Number(grade==='K'?0:grade)%2)strategies.reverse();
  const advance=()=>{setState(s=>nextJourney(s));setStrategy(null);};
  return <main className="journey-shell">
    <header className="journey-top"><button type="button" className="btn btn-secondary" onClick={onClose}>← Home</button><span>Grade {grade==='K'?'K':grade} · {studentName.trim()||'Guest learner'}</span></header>
    <section className="journey-hero"><span className="journey-kicker">LEARN WITH BIP · FIRST MINI-LESSONS</span><h1>{config.title}</h1><p>No timer. No lost lives. A little practice, one step at a time.</p></section>
    <ol className="journey-progress" aria-label="Lesson progress">{['diagnostic','lesson','guided','check','complete'].map((phase,i)=><li key={phase} aria-current={state.phase===phase?'step':undefined}><span>{i+1}</span>{['Start','Learn','Together','Your turn','Snapshot'][i]}</li>)}</ol>
    <section className="journey-card" aria-label={PHASES[state.phase]}>
      <div className="journey-phase"><span aria-hidden="true">✦</span><h2>{PHASES[state.phase]}</h2>{!['lesson','complete'].includes(state.phase)&&<span>{state.position+1} / 2</span>}</div>
      {state.phase==='diagnostic'&&<p>Try two questions. These help us choose what to practice; they are not a grade.</p>}
      {state.phase==='check'&&<p>Try without a picture first. You can still ask for help; we’ll mark it as practice with help.</p>}
      {question&&<>
        <h3 className="journey-question">{question.prompt}</h3>
        {showPicture&&<JourneyPicture visual={question.lessonVisual}/>}
        {isLesson?<>
          {state.support&&<p>Bip chose a simpler worked example to revisit the building blocks. Then we’ll return to this grade’s practice.</p>}
          <p className="journey-worked">{question.explanation}</p>
          <h3>Which strategy fits this problem?</h3>
          <div className="journey-choices">{strategies.map(({text,correct})=><button type="button" className="journey-choice" key={text} onClick={()=>setStrategy(correct)} disabled={strategy===true}>{text}</button>)}</div>
          <p role="status">{strategy===true?'Yes. The picture and the quantities help explain the answer.':strategy===false?'Let’s use the picture and the quantities. Try the strategy that matches the quantities.':''}</p>
          <button type="button" className="btn btn-primary" onClick={advance} disabled={strategy!==true}>Practice together →</button>
        </>:<>
          <div className="journey-choices">{question.options.map(option=><button type="button" className="journey-choice" key={String(option)} disabled={Boolean(state.feedback)} onClick={()=>setState(s=>submitJourney(s,option))}>{String(option)}</button>)}</div>
          {!state.feedback&&!showPicture&&<button type="button" className="btn btn-secondary" onClick={()=>setState(s=>({...s,help:true}))}>💡 Show me a picture</button>}
          {state.feedback&&<div className="journey-feedback" role="status"><strong>{state.feedback.correct?'You found it.':'Let’s look together.'}</strong><p>{question.explanation}</p><button type="button" className="btn btn-primary" onClick={advance}>Continue →</button></div>}
          {state.phase==='guided'&&!state.feedback&&<p className="journey-worked">Bip’s clue: {config.kind==='fraction'?'Check the size of each piece before adding.':config.kind==='place'?'A hundred, a ten and a one have different values.':config.kind==='multiply'?'Each group must have the same number.':'Count all the counters, or make a ten first.'}</p>}
        </>}
      </>}
      {state.phase==='complete'&&record&&<>
        <div className="journey-result"><span aria-hidden="true">{record.independent?'🌱':'🧩'}</span><h3>{record.independent?'Two questions solved independently':'Keep building with practice'}</h3><p>{record.independent?'A good start on this small skill. It does not mean the whole standard is mastered.':'Help is part of learning. Revisit the picture, then try fresh questions on your own.'}</p></div>
        {record.patterns.length>0&&<p>More than one answer suggests trying {config.kind==='fraction'?'equal-sized fraction pieces':config.kind==='place'?'place-value blocks':config.kind==='multiply'?'equal groups':'counting both groups'} again. This is a practice suggestion, not a diagnosis.</p>}
        <p>Next review: {new Date(record.reviewAt).toLocaleString()}. {record.independent?'A later check helps us see what you remember.':'We’ll offer another short check soon.'}</p>
        <div className="journey-actions"><button type="button" className="btn btn-primary" onClick={()=>setState(s=>({...createJourney(grade),phase:'review'}))}>Try the review questions</button><button type="button" className="btn btn-secondary" onClick={()=>{setState(createJourney(grade));setStrategy(null);}}>Repeat the lesson</button></div>
      </>}
    </section>
    {record&&state.phase!=='complete'&&<aside className="journey-saved"><strong>Last snapshot:</strong> {record.independent?'Two independent answers':'Practice with more support'} · {now>=record.reviewAt?'Review is due':'Review is scheduled'}<button type="button" className="btn btn-secondary" onClick={()=>setState({...createJourney(grade),phase:'review'})}>Open review</button></aside>}
    <p className="journey-privacy">Snapshots stay in this browser under the learner name and grade. Use different names on a shared device. Closing a lesson ends that unfinished attempt. No message or school account is sent.</p>
    {storageWarning&&<p role="alert">This browser could not save the snapshot. You can continue, but it may be lost when you leave.</p>}
    {record&&<button type="button" className="journey-delete" onClick={()=>{try{localStorage.removeItem(journeyStorageKey(studentName,grade));setRecord(null);setState(createJourney(grade));setStrategy(null);}catch{setStorageWarning(true);}}}>Delete this learner’s saved snapshot for this grade</button>}
  </main>;
}
