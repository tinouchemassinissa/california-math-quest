import React,{useState} from 'react';
import data from '../../content/approved_questions.json';
import {validatePublicContent} from '../game/publishedContent.js';
import {isAnswerEquivalent} from '../game/mathEngine/answerMath.js';
import JourneyBip from './JourneyBip.jsx';
import VisualManipulative from './manipulatives/VisualManipulative.jsx';
export default function ApprovedPractice({profile,onClose}){
 const questions=validatePublicContent(data).filter(q=>q.grade===profile.grade);
 const [index,setIndex]=useState(0),[feedback,setFeedback]=useState(null),[help,setHelp]=useState(false);
 const question=questions[index];
 return <main className="kids-world"><button type="button" className="btn btn-secondary" onClick={onClose}>← My world</button><div className="kids-layout"><JourneyBip phase="check" feedback={feedback} help={help} eventKey={`${index}-${feedback?.correct}`}/><section className="kids-main"><span className="journey-kicker">REVIEWED SHARED PRACTICE</span>{question?<><h1>{question.title}</h1><p>{index+1} of {questions.length}</p><h2>{question.prompt}</h2>{(help||feedback)&&question.manipulative&&<VisualManipulative manipulative={question.manipulative}/>}<div className="journey-choices">{question.options.map(option=><button type="button" className="journey-choice" key={String(option)} disabled={Boolean(feedback)} onClick={()=>setFeedback({correct:isAnswerEquivalent(option,question.correctAnswer)})}>{String(option)}</button>)}</div>{!feedback&&<button type="button" className="btn btn-secondary" onClick={()=>setHelp(true)}>💡 A clue, please</button>}{help&&<p>{question.hint||'Draw the quantities and think about what is being asked.'}</p>}{feedback&&<div className="journey-feedback"><strong>{feedback.correct?'You found it.':'Let’s check it together.'}</strong><p>{question.explanation||`The checked answer is ${question.correctAnswer}.`}</p><button className="btn btn-primary" type="button" onClick={()=>{setIndex(i=>i+1);setFeedback(null);setHelp(false);}}>Continue →</button></div>}</>:<><h1>A little practice completed.</h1><p>{questions.length?'You reached the end of this shared set.':'There are no shared items for this grade yet.'}</p><button className="btn btn-primary" type="button" onClick={onClose}>Back to my world</button></>}</section></div></main>;
}
