export function bipLessonReaction({phase,feedback,help}){
  if(phase==='complete')return {clip:'events/Bip_recovery_4K60.mp4',gesture:'celebrate',label:'A little progress, one step at a time.',loop:false};
  if(feedback)return feedback.correct?{clip:'events/Bip_recovery_4K60.mp4',gesture:'nod',label:'You found it! Let’s check why it works.',loop:false}:{clip:'greeting.mp4',gesture:'encourage',label:'Let’s try a picture and work through it together.',loop:false};
  if(help||phase==='lesson'||phase==='guided')return {clip:'events/Bip_backup_4K60.mp4',gesture:'point',label:'Look at the quantities. I’ll help you see the pattern.',loop:false};
  return {clip:'events/Bip_busy_4K60.mp4',gesture:'think',label:'Take your time. You can ask me for a picture.',loop:true};
}
