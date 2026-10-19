export const BIP_IDLE_CLIP='gestures-v2/idle.mp4';
export const BIP_WAVE_CLIP='gestures-v2/wave.mp4';
export const BIP_FALLBACK_CLIP='events/Bip_healthy_4K60.mp4';
export function bipLessonReaction({phase,feedback,help}){
  if(phase==='complete')return {clip:'gestures-v2/celebrate.mp4',gesture:'celebrate',label:'A little progress, one step at a time.',loop:false};
  if(feedback)return feedback.correct?{clip:'gestures-v2/nod.mp4',gesture:'nod',label:'You found it! Let’s check why it works.',loop:false}:{clip:'gestures-v2/encourage.mp4',gesture:'encourage',label:'Let’s try a picture and work through it together.',loop:false};
  if(phase==='rest')return {clip:'gestures-v2/rest.mp4',gesture:'rest',label:'Let’s take a little breather. Your maths can wait.',loop:false};
  if(help||phase==='lesson'||phase==='guided')return {clip:'gestures-v2/point.mp4',gesture:'point',label:'Look at the quantities. I’ll help you see the pattern.',loop:false};
  return {clip:'gestures-v2/think.mp4',gesture:'think',label:'Take your time. You can ask me for a picture.',loop:false};
}
