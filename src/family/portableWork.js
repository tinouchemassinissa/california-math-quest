import {parseBackup,FAMILY_VERSION,validateFileBytes,MAX_TOTAL_BYTES} from './familyModel.js';
import {checkStorageRoom,importFamily} from './familyStore.js';
export const MAX_PACKAGE_BYTES=480*1024*1024;
const encode=bytes=>{let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(s);};
const decode=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0));
export async function createWorkPackage(data,ids,{includeNotes=false}={}){
 const chosen=data.works.filter(w=>ids.includes(w.id));if(!chosen.length)throw new Error('Select at least one homework item.');
 const learners=data.learners.filter(l=>chosen.some(w=>w.learnerId===l.id)).map((l,i)=>({id:`folder-${i}`,name:`Learner ${i+1}`,grade:l.grade}));
 const source=data.learners.filter(l=>chosen.some(w=>w.learnerId===l.id));
 const works=[];
 for(const [i,w] of chosen.entries()){
  const bytes=validateFileBytes(await w.file.arrayBuffer(),w.type);
  works.push({id:`work-${i}`,learnerId:learners[source.findIndex(l=>l.id===w.learnerId)].id,title:w.title,date:w.date,status:'to-do',notes:includeNotes?w.notes:'',lessonId:w.lessonId,type:w.type,filename:`worksheet-${i+1}.${w.type==='application/pdf'?'pdf':w.type==='image/jpeg'?'jpg':w.type==='image/png'?'png':'webp'}`,data:encode(bytes)});
 }
 return {kind:'bip-homework',version:FAMILY_VERSION,learners,works,plans:[],learning:[]};
}
export function reviewWorkPackage(raw){
 if(raw?.kind!=='bip-homework'||raw.plans?.length||raw.learning?.length)throw new Error('Choose a Learn with Bip homework package. Use Backup for full library transfers.');
 const clean=parseBackup(raw);if(!clean.works.length)throw new Error('This package has no homework.');
 let total=0;for(const w of clean.works)total+=validateFileBytes(decode(w.data),w.type).length;
 if(total>MAX_TOTAL_BYTES)throw new Error('Package exceeds the 250 MB library limit.');return clean;
}
export async function importWorkPackage(raw,target){
 const clean=reviewWorkPackage(raw);
 if(!target||clean.learners.some(l=>l.grade!==target.grade))throw new Error('Choose a learner with the same grade as the package.');
 await checkStorageRoom(clean.works.reduce((n,w)=>n+decode(w.data).length,0));
 return importFamily({...clean,learners:[target],works:clean.works.map(w=>({...w,id:crypto.randomUUID(),learnerId:target.id})),plans:[],learning:[]});
}
// Optional password protection for files only; this does not lock browser folders.
export async function protectPackage(blob,password){
 if(!crypto.subtle)throw new Error('Password protection needs HTTPS or a secure local connection.');
 if(password.length<12)throw new Error('Use a passphrase of at least 12 characters.');
 const salt=crypto.getRandomValues(new Uint8Array(16)),iv=crypto.getRandomValues(new Uint8Array(12));
 const key=await passwordKey(password,salt,['encrypt']);
 const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv},key,await blob.arrayBuffer());
 return new Blob([JSON.stringify({kind:'bip-protected',version:1,salt:encode(salt),iv:encode(iv),data:encode(new Uint8Array(cipher))})],{type:'application/json'});
}
async function passwordKey(password,salt,usage){const base=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:310000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,usage);}
export async function readPackage(file,password=''){
 if(file.size>MAX_PACKAGE_BYTES)throw new Error('Package is too large. Transfer fewer worksheets at a time.');
 let raw=JSON.parse(await file.text());
 if(raw?.kind==='bip-protected'){
  if(raw.version!==1||typeof raw.data!=='string'||typeof raw.salt!=='string'||typeof raw.iv!=='string')throw new Error('Invalid protected package.');
  const salt=decode(raw.salt),iv=decode(raw.iv);if(salt.length!==16||iv.length!==12)throw new Error('Invalid protected package.');
  try{const key=await passwordKey(password,salt,['decrypt']);raw=JSON.parse(new TextDecoder().decode(await crypto.subtle.decrypt({name:'AES-GCM',iv},key,decode(raw.data))));}catch{throw new Error('Could not unlock this file. Check the passphrase and file.');}
 }
 return raw;
}
export async function smallerPhoto(file){
 if(!file.type.startsWith('image/'))throw new Error('Smaller copy is available for photos only.');
 const bitmap=await createImageBitmap(file);try{
 const scale=Math.min(1,2400/Math.max(bitmap.width,bitmap.height));const canvas=document.createElement('canvas');canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);
 const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(bitmap,0,0,canvas.width,canvas.height);
 const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',0.9));if(!blob||blob.size>=file.size)throw new Error('The original is already smaller. Keep the original.');
 return new File([blob],'worksheet-smaller.jpg',{type:'image/jpeg'});
 }finally{bitmap.close();}
}
