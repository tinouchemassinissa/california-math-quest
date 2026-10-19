import {mistakeCoaching} from '../game/mistakeCoaching.js';
import { teachingCue } from '../game/teachingCue.js';
import JourneyBip from './JourneyBip.jsx';
import React,{useEffect,useState,useRef} from 'react';
import { JOURNEYS,journeyCatalog,journeyConfig,createJourney,currentJourneyIndex,journeyQuestion,submitJourney,nextJourney,journeySummary,journeyStorageKey,readJourneyRecord,journeyProgressKey,readJourneyProgress } from '../game/learningJourney.js';
import VisualManipulative from './manipulatives/VisualManipulative.jsx';

function JourneyPicture({visual}){
  if(visual.type==='journey-subtract')return <div className="journey-picture" role="img" aria-label={`${visual.a} counters with ${visual.b} removed`}><p>Start with {visual.a}. Cross out {visual.b}.</p><div className="journey-counter-row">{Array.from({length:visual.a},(_,i)=><span key={i} className={`journey-counter ${i>=visual.a-visual.b?'removed':''}`}>{i>=visual.a-visual.b?'×':''}</span>)}</div></div>;
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
const PHASES={diagnostic:'Let’s find a starting point',lesson:'Look, draw and explain',guided:'Practice with Bip',check:'Try on your own',review:'Remember it later',complete:'Look what you tried'};
export default function LearningJourney({grade,studentName,onClose,lessonId="starter",onSelectLesson,learnerId}){
  const progressKey=journeyProgressKey(learnerId||studentName,grade,lessonId);
  const [resumed,setResumed]=useState(false);
  const [state,setState]=useState(()=>{try{return readJourneyProgress(localStorage.getItem(progressKey),grade,lessonId)||createJourney(grade,lessonId);}catch{return createJourney(grade,lessonId);}});
  const [record,setRecord]=useState(()=>{try{return readJourneyRecord(localStorage.getItem(journeyStorageKey(learnerId||studentName,grade,lessonId)) ?? (lessonId==='starter'?localStorage.getItem(journeyStorageKey(learnerId||studentName,grade,lessonId).replace(/:starter$/,'')):null),grade,lessonId);}catch{return null;}});
  const [storageWarning,setStorageWarning]=useState(false);
  const [strategy,setStrategy]=useState(null);
  const [coachStep,setCoachStep]=useState(0);
  const coachRef=useRef(null);
  useEffect(()=>{setCoachStep(0);if(state.feedback&&!state.feedback.correct)coachRef.current?.focus();},[state.phase,state.position,state.feedback]);
  const [now,setNow]=useState(Date.now());
  const config=journeyConfig(grade,lessonId);
  useEffect(()=>{setResumed(state.attempts.length>0||state.phase!=='diagnostic');},[]);
  useEffect(()=>{try{if(state.phase==='complete')localStorage.removeItem(progressKey);else localStorage.setItem(progressKey,JSON.stringify({version:1,state}));}catch{setStorageWarning(true);}},[state,progressKey]);
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),60000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{
    if(state.phase!=='complete')return;
    const result=journeySummary(state);
    setRecord(result);setNow(Date.now());
    try{localStorage.setItem(journeyStorageKey(learnerId||studentName,grade,lessonId),JSON.stringify(result));}catch{setStorageWarning(true);}
  },[state,studentName,grade,lessonId,learnerId]);
  const question=state.phase==='complete'?null:journeyQuestion(grade,currentJourneyIndex(state),lessonId);
  const showPicture=state.phase==='lesson'||state.phase==='guided'||state.help;
  const isLesson=state.phase==='lesson';
  const cue=teachingCue(config,grade,state.feedback);
  const focusPicture=showPicture||Boolean(state.feedback&&!state.feedback.correct);
  const strategyText=config.kind==='subtract'?'Take away the requested amount and count what remains':config.kind==='missing'?'Use the whole and the known part to find the other part':config.kind==='fraction'?`Use equal-sized pieces from the same-sized whole, then ${config.operation==='subtract'?'subtract':'add'}`:config.kind==='place'?'Use the value of each digit’s place':config.kind==='multiply'?'Use equal groups and check the related fact':grade==='1'?'Make a ten, then add the counters left over':'Join the groups and count every counter once';
  const otherStrategy=config.kind==='subtract'?'Join the groups instead of removing counters':config.kind==='missing'?'Add the known part to the whole':config.kind==='fraction'?'Add the numerators and add the denominators':config.kind==='place'?'Add the digits without using their places':config.kind==='multiply'?'Always add the two numbers in the question':grade==='1'?'Count only the counters needed to fill ten':'Count only the first group';
  const strategies=[{text:strategyText,correct:true},{text:otherStrategy,correct:false}];
  if(Number(grade==='K'?0:grade)%2)strategies.reverse();
  const coaching=question?mistakeCoaching(question,config,grade):[];
  const mistake=Boolean(state.feedback&&!state.feedback.correct);
  const coachingLine=mistake?`Step ${coachStep+1}. ${coaching[coachStep].text}`:strategy===false?'Let’s look at the picture and choose the strategy that matches the quantities.':cue.text;
  const companionFeedback=strategy===false?{correct:false}:state.feedback;
  const advance=()=>{setCoachStep(0);setState(s=>nextJourney(s));setStrategy(null);};
  return <main className="journey-shell">
    <header className="journey-top"><button type="button" className="btn btn-secondary" onClick={onClose}>← Home</button><span>Grade {grade==='K'?'K':grade} · {studentName.trim()||'Guest learner'}</span></header>
    <section className="journey-hero"><span className="journey-kicker">LEARN WITH BIP · YOUR NEXT ADVENTURE</span><h1>{config.title}</h1><p>No timer. No lost lives. A little practice, one step at a time.</p></section>
    {resumed&&<aside className="journey-saved" role="status">Welcome back! Continue where you stopped.<button type="button" className="btn btn-secondary" onClick={()=>{setState(createJourney(grade,lessonId));setStrategy(null);setResumed(false);}}>Start this lesson again</button></aside>}
    <nav className="journey-lesson-picker" aria-label="Choose a lesson">{journeyCatalog(grade).map(item=><button type="button" key={item.id} aria-pressed={item.id===lessonId} onClick={()=>onSelectLesson?.(item.id)}>{item.title}</button>)}</nav>
    <ol className="journey-progress" aria-label="Lesson progress">{['diagnostic','lesson','guided','check','complete'].map((phase,i)=><li key={phase} aria-current={state.phase===phase?'step':undefined}><span>{i+1}</span>{['Start','Learn','Together','Your turn','Snapshot'][i]}</li>)}</ol>
    <div className="journey-workspace"><JourneyBip cue={coachingLine} phase={state.phase} feedback={companionFeedback} help={state.help} eventKey={`${lessonId}-${state.phase}-${state.position}-${state.attempts.length}`} />
    <section className="journey-card" aria-label={PHASES[state.phase]}>
      <div className="journey-phase"><span aria-hidden="true">✦</span><h2>{PHASES[state.phase]}</h2>{!['lesson','complete'].includes(state.phase)&&<span>{state.position+1} / 2</span>}</div>
      {state.phase==='diagnostic'&&<p>Try two questions. These help us choose what to practice; they are not a grade.</p>}
      {state.phase==='check'&&<p>Try without a picture first. You can still ask for help; we’ll mark it as practice with help.</p>}
      {question&&<>
        <h3 className="journey-question">{question.prompt}</h3>
        {mistake&&<section className="journey-coaching" aria-label="Work through this with Bip"><div className="journey-coaching-heading" ref={coachRef} tabIndex={-1}><span aria-hidden="true">💛</span><h4>Not quite yet—and that’s okay.</h4></div><p>Let’s break it down together, one small step at a time.</p><ol className="journey-coaching-progress" aria-label="Breakdown progress">{coaching.map((step,i)=><li key={step.title} aria-current={i===coachStep?'step':undefined} data-done={i<coachStep}>{i<coachStep?'✓':i+1}</li>)}</ol><div className="journey-coaching-step" role="status"><small>STEP {coachStep+1} OF {coaching.length}</small><h4>{coaching[coachStep].title}</h4><p>{coaching[coachStep].text}</p></div><div className="journey-actions">{coachStep>0&&<button type="button" className="btn btn-secondary" onClick={()=>setCoachStep(s=>s-1)}>← Previous step</button>}{coachStep<coaching.length-1?<button type="button" className="btn btn-primary" onClick={()=>setCoachStep(s=>s+1)}>Show next step →</button>:<button type="button" className="btn btn-primary" onClick={advance}>Try the next question →</button>}</div><p className="journey-coaching-note">A mistake is a clue, not a grade. The picture is here to help.</p></section>}
        {focusPicture&&<div className="journey-visual-focus" data-focus={cue.focus}><p className="journey-visual-cue">👆 {cue.text}</p><JourneyPicture visual={question.lessonVisual}/></div>}
        {isLesson?<>
          {state.support&&<p>Bip chose a simpler worked example to revisit the building blocks. Then we’ll return to this grade’s practice.</p>}
          <p className="journey-worked">{question.explanation}</p>
          <h3>Which strategy fits this problem?</h3>
          <div className="journey-choices">{strategies.map(({text,correct})=><button type="button" className="journey-choice" key={text} onClick={()=>setStrategy(correct)} disabled={strategy===true}>{text}</button>)}</div>
          <p role="status">{strategy===true?'Yes. The picture and the quantities help explain the answer.':strategy===false?'Not quite yet—and that’s okay. Let’s look at the picture together. Choose the strategy that matches these quantities.':''}</p>
          <button type="button" className="btn btn-primary" onClick={advance} disabled={strategy!==true}>Practice together →</button>
        </>:<>
          {!mistake&&<div className="journey-choices">{question.options.map(option=><button type="button" className="journey-choice" key={String(option)} disabled={Boolean(state.feedback)} onClick={()=>setState(s=>submitJourney(s,option))}>{String(option)}</button>)}</div>}
          {!state.feedback&&!showPicture&&<button type="button" className="btn btn-secondary" onClick={()=>setState(s=>({...s,help:true}))}>💡 Show me a picture</button>}
          {state.feedback?.correct&&<div className="journey-feedback" role="status"><strong>{state.feedback.correct?'You found it.':'Let’s look together.'}</strong><p>{question.explanation}</p><button type="button" className="btn btn-primary" onClick={advance}>Continue →</button></div>}
          {state.phase==='guided'&&!state.feedback&&<p className="journey-worked">Bip’s clue: {config.kind==='fraction'?`Check the size of each piece before ${config.operation==='subtract'?'subtracting':'adding'}.`:config.kind==='place'?'A hundred, a ten and a one have different values.':config.kind==='multiply'?'Each group must have the same number.':config.kind==='subtract'?'Remove the requested counters.':config.kind==='missing'?'Find the part needed to reach the whole.':'Count all the counters, or make a ten first.'}</p>}
        </>}
      </>}
      {state.phase==='complete'&&record&&<>
        <div className="journey-result"><span aria-hidden="true">{record.independent?'🌱':'🧩'}</span><h3>{record.independent?'You tried it on your own!':'Keep building with practice'}</h3><p>{record.independent?'You worked through two questions without help. Keep exploring!':'Help is part of learning. Revisit the picture, then try fresh questions on your own.'}</p></div>
        <p>Come back for another little practice when you’re ready.</p>
        <div className="journey-actions"><button type="button" className="btn btn-primary" onClick={()=>setState(s=>({...createJourney(grade,lessonId),phase:'review',reviewSet:((record?.reviewSet??0)+1)%2}))}>Try the review questions</button><button type="button" className="btn btn-secondary" onClick={()=>{setState(createJourney(grade,lessonId));setStrategy(null);}}>Repeat the lesson</button></div>
      </>}
    </section></div>
    {storageWarning&&<p role="alert">Your progress could not be saved. Ask a grown-up to help before closing the app.</p>}
  </main>;
}
