import {verifyQuestion} from './mathEngine/verifier.js';
const FIELDS=new Set(['id','grade','standard','title','prompt','correctAnswer','options','explanation','hint','manipulative']);
export function validatePublicContent(data){
 if(!data||data.version!==1||!Array.isArray(data.questions)||data.questions.length>10000)throw new Error('Invalid approved-content package');
 const seen=new Set();
 for(const q of data.questions){
  if(!q||Object.keys(q).some(key=>!FIELDS.has(key)))throw new Error('Approved packages must not contain source files or private metadata');
  if(seen.has(q.id))throw new Error('Duplicate approved question ID');seen.add(q.id);
  const result=verifyQuestion(q);if(!result.valid)throw new Error(`Approved item ${q.id}: ${result.error}`);
  if(/\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b|https?:\/\//i.test([q.prompt,q.hint,q.explanation,q.title].join(' ')))throw new Error('Remove personal contact information or external links before publishing');
 }
 return data.questions;
}
export function mergeApprovedContent(existing,incoming){validatePublicContent(existing);validatePublicContent(incoming);const questions=new Map(existing.questions.map(q=>[q.id,q]));for(const q of incoming.questions)questions.set(q.id,q);const result={version:1,questions:[...questions.values()].sort((a,b)=>a.id.localeCompare(b.id))};validatePublicContent(result);return result;}
