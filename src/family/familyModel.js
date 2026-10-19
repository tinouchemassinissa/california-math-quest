import { journeyCatalog,journeyStorageKey,readJourneyRecord,readJourneyProgress } from '../game/learningJourney.js';
export const FAMILY_VERSION=1;
export const MAX_FILE_BYTES=8*1024*1024;
export const MAX_TOTAL_BYTES=50*1024*1024;
export const GRADES=['K','1','2','3','4','5'];
export const WORK_STATUSES=['to-do','done','reviewed'];
export function localDate(date=new Date()){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function cleanText(value,max=200){if(typeof value!=='string')throw new TypeError('Text is required');const result=value.trim();if(result.length>max)throw new RangeError('Text is too long');return result;}
export function validDate(value){return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&!Number.isNaN(Date.parse(value+'T12:00:00'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value;}
export function validateLearner(record){if(!record||!cleanText(record.name,40)||!GRADES.includes(record.grade)||(typeof record.id!=='string'||!/^[-\w]{1,80}$/.test(record.id)))throw new Error('Invalid learner');return {id:record.id,name:cleanText(record.name,40),grade:record.grade};}
export function suggestHomework(filename,grade){
 const title=String(filename).replace(/\.[^.]+$/,'').replace(/[_-]+/g,' ').replace(/\s+/g,' ').slice(0,120).trim()||'New homework';
 const match=String(filename).match(/(?<!\d)(\d{4}-\d{2}-\d{2})(?!\d)/);
 const options=journeyCatalog(grade);
 const hint=/subtract|take.?away/i.test(filename)?'subtract':/divis|divid/i.test(filename)?'divide':/hundred/i.test(filename)?'hundreds':/tens/i.test(filename)?'tens':/missing|make.?ten/i.test(filename)?'missing':null;
 const picked=hint?options.find(o=>o.id.includes(hint)||o.kind===hint):null;
 return {title,date:match&&validDate(match[1])?match[1]:localDate(),lessonId:picked?.id||null,source:'Filename suggestion only; worksheet contents have not been read.'};
}
export function validateWork(record,learners){
 if(!record||(typeof record.id!=='string'||!/^[-\w]{1,80}$/.test(record.id))||!learners.some(p=>p.id===record.learnerId)||!cleanText(record.title,120)||!validDate(record.date)||!WORK_STATUSES.includes(record.status))throw new Error('Invalid homework details');
 const learner=learners.find(p=>p.id===record.learnerId);
 if(record.lessonId!==null&&!journeyCatalog(learner.grade).some(l=>l.id===record.lessonId))throw new Error('Unknown practice lesson');
 if(typeof record.notes!=='string'||record.notes.length>2000||!['image/jpeg','image/png','image/webp','application/pdf'].includes(record.type)||typeof record.filename!=='string'||record.filename.length>240)throw new Error('Invalid homework file');
 return record;
}
export function validateFileBytes(bytes,type){
 const b=bytes instanceof Uint8Array?bytes:new Uint8Array(bytes);
 if(!b.length||b.length>MAX_FILE_BYTES)throw new Error('Files must be no larger than 8 MB');
 const ascii=(start,len)=>String.fromCharCode(...b.slice(start,start+len));
 const valid=type==='image/jpeg'?b[0]===255&&b[1]===216&&b[2]===255:type==='image/png'?b.slice(0,8).join(',')==='137,80,78,71,13,10,26,10':type==='image/webp'?ascii(0,4)==='RIFF'&&ascii(8,4)==='WEBP':type==='application/pdf'?ascii(0,5)==='%PDF-':false;
 if(!valid)throw new Error('Use a valid JPG, PNG, WebP or PDF file');return b;
}
export function validatePlan(plan,learners){
 const learner=learners.find(p=>p.id===plan?.learnerId);
 if(!learner||(typeof plan.id!=='string'||!/^[-\w]{1,80}$/.test(plan.id))||!validDate(plan.date)||!Array.isArray(plan.lessons)||plan.lessons.length>3||new Set(plan.lessons).size!==plan.lessons.length||!plan.lessons.every(id=>journeyCatalog(learner.grade).some(l=>l.id===id)))throw new Error('Invalid practice plan');
 return plan;
}
export function parseBackup(input){
 const data=typeof input==='string'?JSON.parse(input):input;
 if(!data||data.version!==FAMILY_VERSION||!Array.isArray(data.learners)||data.learners.length>100||!Array.isArray(data.works)||data.works.length>500||!Array.isArray(data.plans)||data.plans.length>1000)throw new Error('Unsupported family backup');
 const learners=data.learners.map(validateLearner);
 const unique=items=>new Set(items.map(x=>x.id)).size===items.length;
 if(!unique(learners)||!unique(data.works)||!unique(data.plans))throw new Error('Duplicate record IDs in backup');
 for(const work of data.works){validateWork(work,learners);if(typeof work.data!=='string'||work.data.length>Math.ceil(MAX_FILE_BYTES/3)*4||(work.data.length%4!==0||!/^[A-Za-z0-9+/]*={0,2}$/.test(work.data)))throw new Error('Invalid backup attachment');}
 data.plans.forEach(p=>validatePlan(p,learners));
 const learning=validateLearningBackup(data.learning??[],learners);
 return {version:FAMILY_VERSION,learners,works:data.works,plans:data.plans,learning};
}
export function parentStrategy(grade){
 return {K:['Count real objects','Ask: “How do you know you counted each one?”','Move counters into two groups, then join or remove them.'],1:['Make a ten','Ask: “Which part would fill ten first?”','Use counters before asking for a written number sentence.'],2:['Use place-value blocks','Ask: “What is this digit worth in its place?”','A hundred is ten tens; a ten is ten ones.'],3:['Draw equal groups','Ask: “How many groups, and how many in each?”','Connect multiplication and division using the same quantities.'],4:['Use the same-sized whole','Ask: “Are the pieces the same size?”','For like denominators, combine or remove pieces without changing their size.'],5:['Rename fraction pieces','Ask: “Can you show equivalent fractions with equal-sized parts?”','Find a common denominator before adding or subtracting.']}[grade];
}

export function validateLearningBackup(entries,learners){
 if(!Array.isArray(entries)||entries.length>1800)throw new Error('Invalid learning backup');
 const allowed=new Map();
 for(const learner of learners)for(const lesson of journeyCatalog(learner.grade)){
  const key=journeyStorageKey(learner.id,learner.grade,lesson.id);
  allowed.set(key,{grade:learner.grade,lessonId:lesson.id,progress:false});
  allowed.set(key+':progress',{grade:learner.grade,lessonId:lesson.id,progress:true});
 }
 const seen=new Set();
 return entries.map(entry=>{
  const spec=allowed.get(entry?.key);
  if(!spec||seen.has(entry.key)||typeof entry.value!=='string'||entry.value.length>20000)throw new Error('Invalid learning record');
  seen.add(entry.key);
  if(!(spec.progress?readJourneyProgress:readJourneyRecord)(entry.value,spec.grade,spec.lessonId))throw new Error('Learning record failed validation');
  return {key:entry.key,value:entry.value};
 });
}
