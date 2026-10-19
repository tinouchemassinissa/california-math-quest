import {readFileSync,writeFileSync,mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync} from 'node:child_process';
import {mergeApprovedContent,validatePublicContent} from '../src/game/publishedContent.js';
const [input,repoArg,...flags]=process.argv.slice(2);
if(!input||!repoArg||flags.some(flag=>flag!=='--dry-run'))throw new Error('Usage: node admin/publish.mjs approved.json /private/repo [--dry-run]');
const base=process.env.BIP_PUBLISH_BASE||'main';
if(!['main','feat/bip-school-math-correctness'].includes(base))throw new Error('Unsupported publication review base');
const incoming=JSON.parse(readFileSync(input,'utf8'));validatePublicContent(incoming);if(!incoming.questions.length)throw new Error('No approved questions to publish');
if(flags.includes('--dry-run')){console.log(JSON.stringify({questions:incoming.questions.length,base,target:'content/approved_questions.json',repository:'tinouchemassinissa/california-math-quest',action:'Create a branch and pull request, never merge main'}));process.exit(0);}
const repo=resolve(repoArg),run=(command,args,cwd=repo)=>execFileSync(command,args,{cwd,encoding:'utf8',timeout:180000,stdio:['ignore','pipe','pipe']}).trim();
const origin=run('git',['remote','get-url','origin']);
if(!['https://github.com/tinouchemassinissa/california-math-quest.git','https://github.com/tinouchemassinissa/california-math-quest','git@github.com:tinouchemassinissa/california-math-quest.git'].includes(origin))throw new Error('Unexpected GitHub origin; publication stopped');
if(run('git',['status','--porcelain']))throw new Error('Use a clean dedicated publishing checkout');
run('gh',['auth','status']);run('git',['fetch','origin',base]);
const temporary=mkdtempSync(join(tmpdir(),'bip-publish-')),work=join(temporary,'worktree'),branch=`content/bip-${Date.now()}`;
let added=false;
try{
 run('git',['worktree','add','-b',branch,work,`origin/${base}`]);added=true;
 if(!existsSync(join(work,'scripts/checkPublishedContent.mjs')))throw new Error('The review base lacks app-content support. Merge PR #1 or explicitly configure BIP_PUBLISH_BASE=feat/bip-school-math-correctness for a stacked review PR');
 const path=join(work,'content/approved_questions.json');const merged=mergeApprovedContent(JSON.parse(readFileSync(path,'utf8')),incoming);
 writeFileSync(path,JSON.stringify(merged,null,2)+'\n');
 run('npm',['ci'],work);run('npm',['test'],work);run('npm',['run','build'],work);
 run('git',['add','--','content/approved_questions.json'],work);
 if(!run('git',['diff','--cached','--name-only'],work))throw new Error('No content changes to publish');
 run('git',['commit','-m','Add reviewed Bip shared practice'],work);run('git',['push','origin',`HEAD:refs/heads/${branch}`],work);
 const body=join(temporary,'pr-body.txt');writeFileSync(body,'Add owner-reviewed anonymous shared questions. This review PR does not deploy the app. Original scans, family records and private metadata are excluded. Content checks, tests and production build passed locally. Review the preview before merging.\n');
 console.log(run('gh',['pr','create','--repo','tinouchemassinissa/california-math-quest','--base',base,'--head',branch,'--title','Add reviewed Bip shared practice','--body-file',body],work));
}finally{if(added)run('git',['worktree','remove','--force',work]);rmSync(temporary,{recursive:true,force:true});}
