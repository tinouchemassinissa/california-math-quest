import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {validatePublicContent,mergeApprovedContent} from './publishedContent.js';
import {verifyQuestion} from './mathEngine/verifier.js';
const q={id:'original-1',grade:'3',standard:'3.OA.C.7',title:'Equal groups',prompt:'What is 3 × 4?',correctAnswer:12,options:[7,12,9,16],explanation:'3 × 4 = 12.',hint:'Draw equal groups.'};
test('published content rejects private fields, contact text and invalid arithmetic',()=>{
 assert.equal(validatePublicContent({version:1,questions:[q]}).length,1);
 for(const change of [{source_file:'private.jpg'},{learnerName:'private'},{prompt:'Contact child@example.com'},{correctAnswer:13,options:[7,13,9,16]}])assert.throws(()=>validatePublicContent({version:1,questions:[{...q,...change}]}));
 assert.throws(()=>validatePublicContent({version:1,questions:[q,q]}));
});
test('approved merges preserve existing questions and only replace matching IDs',()=>{
 const result=mergeApprovedContent({version:1,questions:[q]},{version:1,questions:[{...q,id:'original-2'}]});assert.equal(result.questions.length,2);
 const update=mergeApprovedContent(result,{version:1,questions:[{...q,title:'Updated title'}]});assert.equal(update.questions.length,2);assert.equal(update.questions[0].title,'Updated title');
});
test('publisher dry-run validates package and never starts a GitHub operation',()=>{
 const temp=mkdtempSync(join(tmpdir(),'bip-publish-test-'));try{const input=join(temp,'approved.json');writeFileSync(input,JSON.stringify({version:1,questions:[q]}));const out=JSON.parse(execFileSync(process.execPath,['admin/publish.mjs',input,temp,'--dry-run'],{encoding:'utf8'}));assert.equal(out.questions,1);assert.equal(out.target,'content/approved_questions.json');assert.match(out.action,/never merge/);}finally{rmSync(temp,{recursive:true,force:true});}
});
test('corruption detector does not reject ordinary words containing nan',()=>{
 const banana={id:'banana-1',grade:'K',standard:'K.OA.A.2',title:'Count bananas',prompt:'There are 3 bananas and 2 more. How many bananas are there?',correctAnswer:5,options:[3,4,5,6],explanation:'3 + 2 = 5.',hint:'Count each banana.'};assert.equal(verifyQuestion(banana).valid,true);assert.equal(verifyQuestion({...banana,hint:'The answer is NaN'}).valid,false);
});
test('bundled shared-content package passes release checks',()=>{assert.doesNotThrow(()=>validatePublicContent(JSON.parse(readFileSync('content/approved_questions.json','utf8'))));});
