import {verifyQuestion} from '../src/game/mathEngine/verifier.js';
let input='';for await(const chunk of process.stdin){input+=chunk;if(input.length>100000)throw new Error('Question too large');}
try{const question=JSON.parse(input);const result=verifyQuestion(question);console.log(JSON.stringify(result));process.exitCode=result.valid?0:1;}catch(error){console.log(JSON.stringify({valid:false,error:error.message,errors:[error.message]}));process.exitCode=1;}
