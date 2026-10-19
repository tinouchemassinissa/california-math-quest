import React, { useState } from 'react';
import { buildGuidedLesson, LESSON_STAGES, advanceLesson } from '../game/guidedLesson.js';
import VisualManipulative from './manipulatives/VisualManipulative.jsx';

export default function GuidedLesson({ question, open, onOpen, onClose, onPracticeSimilar, onSpeak }) {
  const lesson=buildGuidedLesson(question);
  const [stage,setStage]=useState(0);
  const [step,setStep]=useState(0);
  if(!open)return <button className="bip-guide-launch" type="button" onClick={onOpen}>💡 Learn with Bip <span>A clue, a picture, then steps</span></button>;
  const line=stage===0?lesson.firstHint:stage===1?lesson.pictureHint:lesson.steps[step] || 'Read the question, then draw what you know.';
  return <section className="bip-guide" aria-label="Learn with Bip">
    <div className="bip-guide-heading"><div><span className="bip-guide-eyebrow">LET’S LEARN TOGETHER</span><h3>Bip is here to help</h3></div><button type="button" className="bip-guide-close" onClick={onClose} aria-label="Close learning guide">✕</button></div>
    <ol className="bip-guide-stages" aria-label="Learning steps">{LESSON_STAGES.map((label,i)=><li key={label}><button type="button" aria-current={stage===i?'step':undefined} onClick={()=>setStage(i)}><span>{i+1}</span>{label}</button></li>)}</ol>
    <div className="bip-guide-content" aria-live="polite">
      {stage===0&&<p className="bip-guide-clue">{lesson.firstHint}</p>}
      {stage>=1&&(lesson.visual?<VisualManipulative manipulative={lesson.visual}/>:<p>Use the scratchpad to draw the quantities in the question.</p>)}
      {stage===2&&<div className="bip-guide-work"><span>Step {step+1} of {Math.max(1,lesson.steps.length)}</span><p>{lesson.steps[step]||'Let’s read the question together.'}</p></div>}
    </div>
    <div className="bip-guide-actions">
      <button type="button" className="btn btn-secondary" onClick={()=>onSpeak?.(line)}>🔊 Read this step</button>
      {stage<2?<button type="button" className="btn btn-primary" onClick={()=>setStage(s=>advanceLesson(s))}>{stage===0?'Show me a picture':'Solve it together'} →</button>
        :step<lesson.steps.length-1?<button type="button" className="btn btn-primary" onClick={()=>setStep(s=>s+1)}>Next step →</button>
        :onPracticeSimilar&&<button type="button" className="btn btn-primary" onClick={()=>onPracticeSimilar(question.standard)}>Try one like this →</button>}
    </div>
    <p className="bip-guide-note">Take your time. You choose when to move on. Asking for help is part of learning.</p>
  </section>;
}
