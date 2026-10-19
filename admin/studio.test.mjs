import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {JSDOM} from 'jsdom';
import qrcode from 'qrcode-generator';
import {STANDARDS} from '../src/data/californiaCurriculum.js';
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const script=fs.readFileSync(new URL('./studio.js',import.meta.url),'utf8');
const registry=JSON.parse(fs.readFileSync(new URL('./standards.json',import.meta.url)));
const settle=()=>new Promise(r=>setTimeout(r,10));
async function open({mfa=false,drafts=[]}={}){
 const dom=new JSDOM(html,{url:'https://studio.test',runScripts:'outside-only'}),w=dom.window,calls=[];
 w.HTMLElement.prototype.scrollIntoView=()=>{};w.confirm=()=>true;w.qrcode=qrcode;
 let draws=0;w.HTMLCanvasElement.prototype.getContext=()=>({clearRect(){},fillRect(){draws++;},set fillStyle(v){}});
 w.fetch=async(url,options)=>{const body=options?.body?JSON.parse(options.body):null;calls.push({url,body});let result={};
 if(url==='/standards.json')result=registry;
 else if(url==='/api/auth-state')result={setup_required:false,mfa_enabled:mfa};
 else if(url==='/api/release')result={revision:'123456789abc',review_base:'main'};
 else if(url==='/api/drafts')result={csrf:'test',drafts,mfa_enabled:mfa,source_count:0,source_bytes:0};
 else if(url==='/api/check')result={valid:true,errors:[]};
 else if(url==='/api/mfa/begin')result={secret:'TEST-ONLY',uri:'otpauth://totp/Test?secret=JBSWY3DPEHPK3PXP&issuer=Test'};
 else if(url==='/api/mfa/enable')result={recovery_codes:['synthetic-test-code']};
 return {ok:true,json:async()=>result};};w.eval(script);await settle();return {w,el:id=>w.document.getElementById(id),calls,close:()=>dom.window.close(),draws:()=>draws};
}
test('Studio standards list matches the actual curriculum registry',()=>{
 assert.deepEqual(registry,Object.values(STANDARDS).map(({code,grade,title,desc})=>({code,grade,title,desc})));
});
test('guided form filters standards, invalidates checks on edits and keeps text safe',async()=>{
 const app=await open();try{const {w,el,calls}=app;
 el('sample-question').click();assert.equal(el('field-grade').value,'3');
 assert.ok([...el('field-standard').options].filter(o=>o.value).every(o=>o.value.startsWith('3.')));
 await el('check').onclick(new w.Event('click'));el('reviewed').checked=true;el('reviewed').dispatchEvent(new w.Event('change'));assert.equal(el('approve').disabled,false);
 el('choice-1').value='13';el('choice-1').dispatchEvent(new w.Event('input'));assert.equal(el('approve').disabled,true);assert.equal(el('field-correctAnswer').value,'');
 el('field-correctAnswer').value='1';el('field-correctAnswer').dispatchEvent(new w.Event('change'));assert.equal(JSON.parse(el('question').value).correctAnswer,13);
 el('field-prompt').value='<img src=x onerror=alert(1)>';el('field-prompt').dispatchEvent(new w.Event('input'));assert.equal(el('preview-prompt').children.length,0);assert.match(el('preview-prompt').textContent,/<img/);
 el('field-grade').value='K';el('field-grade').dispatchEvent(new w.Event('change'));assert.equal(el('field-standard').value,'');assert.ok([...el('field-standard').options].filter(o=>o.value).every(o=>o.value.startsWith('K.')));
 assert.ok(calls.some(c=>c.url==='/api/check'));
 }finally{app.close();}
});
test('draft library searches and filters without discarding an unchanged question',async()=>{
 const questions=[{question:{id:'one',grade:'3',standard:'3.OA.C.7',title:'Groups',options:[1,2,3,4]},approved:false},{question:{id:'two',grade:'K',standard:'K.CC.A.1',title:'Counting',options:[1,2,3,4]},approved:true}];
 const app=await open({drafts:questions});try{const {w,el}=app;assert.equal(el('drafts').children.length,2);el('draft-filter').value='approved';el('draft-filter').dispatchEvent(new w.Event('change'));assert.equal(el('drafts').children.length,1);assert.match(el('drafts').textContent,/Counting/);el('draft-search').value='missing';el('draft-search').dispatchEvent(new w.Event('input'));assert.match(el('drafts').textContent,/No questions match/);
 }finally{app.close();}
});
test('MFA UI requests password reauthentication, renders QR locally and shows replacement codes',async()=>{
 const app=await open();try{const {w,el,calls}=app;el('mfa-password').value='synthetic private password';await el('mfa-begin-form').onsubmit(new w.Event('submit'));assert.equal(el('mfa-enrol').hidden,false);assert.ok(app.draws()>100);assert.equal(el('mfa-secret').textContent,'TEST-ONLY');assert.equal(calls.find(c=>c.url==='/api/mfa/begin').body.password,'synthetic private password');el('mfa-code').value='123456';await el('mfa-enable-form').onsubmit(new w.Event('submit'));assert.equal(el('recovery-codes').hidden,false);assert.equal(el('mfa-secret').textContent,'');assert.equal(el('codes').textContent,'synthetic-test-code');
 }finally{app.close();}
 const protectedApp=await open({mfa:true});try{assert.equal(protectedApp.el('login-otp').required,true);assert.equal(protectedApp.el('login-otp-label').hidden,false);assert.match(protectedApp.el('mfa-status').textContent,/is on/);}finally{protectedApp.close();}
});

test('release screen identifies Studio separately from app deployment',async()=>{
 const app=await open();try{assert.match(app.el('release-version').textContent,/Studio 123456789abc/);assert.match(app.el('release-version').textContent,/App deployment not verified/);assert.equal(app.el('error').textContent,'');}finally{app.close();}
});
