import React, { useState,useEffect,useRef } from 'react';
import { buildGuidedLesson, LESSON_STAGES, advanceLesson, buildTogetherTurns } from '../game/guidedLesson.js';
import { isAnswerEquivalent } from '../game/mathEngine/answerMath.js';
import VisualManipulative from './manipulatives/VisualManipulative.jsx';

export default function GuidedLesson({ question, open, onOpen, onClose, onPracticeSimilar, onSpeak }) {
  const lesson=buildGuidedLesson(question);
  const [stage,setStage]=useState(0);
  const [step,setStep]=useState(0);
  const guideRef=useRef(null);
  const turns=buildTogetherTurns(question);
  const [turn,setTurn]=useState(0),[entry,setEntry]=useState(''),[response,setResponse]=useState(''),[worked,setWorked]=useState(false),[thinking,setThinking]=useState(false);
  useEffect(()=>{setTurn(0);setEntry('');setResponse('');setWorked(false);setThinking(false);},[open,question.id,question.prompt]);
  const current=turns[turn];
  const checkTurn=e=>{
    e.preventDefault();
    if(isAnswerEquivalent(entry,current.answer)||String(entry).replace(/\s/g,'')===String(current.answer).replace(/\s/g,'')){
      setResponse('Yes! You figured out that part.');
      setTurn(t=>t+1);setEntry('');
    }else setResponse('Not quite yet. '+current.hint+' You can try again.');
  };
  useEffect(()=>{if(open){setStage(0);setStep(0);guideRef.current?.focus();}},[open]);
  if(!open)return <button className="bip-guide-launch" type="button" onClick={onOpen}>💡 Learn with Bip <span>A clue, a picture, then steps</span></button>;
  const line=stage===0?lesson.firstHint:stage===1?lesson.pictureHint:!worked?(current?.prompt||'You worked through the parts. Try the question again.'):lesson.steps[step] || 'Read the question, then draw what you know.';
  return <section className="bip-guide" aria-label="Learn with Bip" ref={guideRef} tabIndex={-1}>
    <div className="bip-guide-heading"><div><span className="bip-guide-eyebrow">LET’S LEARN TOGETHER</span><h3>Bip is here to help</h3></div><button type="button" className="bip-guide-close" onClick={onClose} aria-label="Close learning guide">✕</button></div>
    <ol className="bip-guide-stages" aria-label="Learning steps">{LESSON_STAGES.map((label,i)=><li key={label}><button type="button" aria-current={stage===i?'step':undefined} onClick={()=>setStage(i)}><span>{i+1}</span>{label}</button></li>)}</ol>
    <div className="bip-guide-content" aria-live="polite">
      {stage===0&&<p className="bip-guide-clue">{lesson.firstHint}</p>}
      {stage>=1&&(lesson.visual?<VisualManipulative manipulative={lesson.visual}/>:<p>Use the scratchpad to draw the quantities in the question.</p>)}
      {stage===2&&!worked&&<div className="bip-guide-work">
        {turns.length>0 ? current ? <form onSubmit={checkTurn}>
          <span>Your turn {turn+1} of {turns.length}</span><p>{current.prompt}</p>
          <label>Your idea <input aria-label="Your step answer" value={entry} onChange={e=>setEntry(e.target.value)} autoComplete="off" /></label>
          <button type="submit" className="btn btn-primary" disabled={!entry.trim()}>Check this step</button>
          <button type="button" className="btn btn-secondary" onClick={()=>setResponse(current.hint)}>Give me a clue</button>
        </form> : <p>You built the answer, one part at a time! Close this guide to try the question again.</p>
        : <><p>What do you know already? What is the question asking you to find?</p><p>Use your math paper to show one small step. Bip does not read or grade your drawing.</p><button type="button" className="btn btn-secondary" onClick={()=>setThinking(true)}>I’m ready for the next clue</button>{thinking&&<p>{lesson.firstHint}</p>}</>}
        <p role="status">{response}</p>
        <button type="button" className="btn btn-secondary" onClick={()=>setWorked(true)}>Show a worked example for this question (includes the answer)</button>
      </div>}
      {stage===2&&worked&&<div className="bip-guide-work"><span>Step {step+1} of {Math.max(1,lesson.steps.length)}</span><p>{lesson.steps[step]||'Let’s read the question together.'}</p></div>}
    </div>
    <div className="bip-guide-actions">
      <button type="button" className="btn btn-secondary" onClick={()=>onSpeak?.(line)}>🔊 Read this step</button>
      {stage<2?<button type="button" className="btn btn-primary" onClick={()=>setStage(s=>advanceLesson(s))}>{stage===0?'Show me a picture':'Solve it together'} →</button>
        :worked&&step<lesson.steps.length-1?<button type="button" className="btn btn-primary" onClick={()=>setStep(s=>s+1)}>Next step →</button>
        :worked&&onPracticeSimilar&&<button type="button" className="btn btn-primary" onClick={()=>onPracticeSimilar(question.standard)}>Try one like this →</button>}
    </div>
    <p className="bip-guide-note">Take your time. You choose when to move on. Asking for help is part of learning.</p>
  </section>;
}
