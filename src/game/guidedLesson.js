import { Rational, lcm } from './mathEngine/rational.js';
import { isAnswerEquivalent } from './mathEngine/answerMath.js';
import { buildLessonGuide } from './coachGuide.js';

// No model-generated arithmetic. Lessons are derived from the given operands and checked.
export function buildGuidedLesson(question) {
  const base = buildLessonGuide(question);
  if (!question) return { ...base, kind:'general', steps:[], visual:null };
  if (question.standard === '3.OA.C.7') {
    const m = question.prompt.match(/What is (\d+) ([×÷]) (\d+)\?/);
    if (m) {
      const a=Number(m[1]), b=Number(m[3]), division=m[2]==='÷';
      const answer=division?a/b:a*b;
      if (a <= 100 && b <= 10 && (!division || b > 0) && Number.isInteger(answer) && isAnswerEquivalent(answer,question.correctAnswer)) {
        const groups=division?b:a, each=division?answer:b;
        const first=Math.min(groups,5), rest=groups-first;
        return { ...base, kind:'groups', firstHint: division ? 'Share the total into equal groups. Each group must get the same number.' : 'Multiplication counts equal groups. Find how many groups there are and how many are in each group.',
          visual:{type:'guided-groups', groups, each},
          steps: division ? [
            `Start with ${a} objects and make ${b} equal groups.`,
            `Give each group one object at a time until all ${a} objects are shared. Every group has ${answer}.`,
            `Check with multiplication: ${b} × ${answer} = ${a}. So ${a} ÷ ${b} = ${answer}.`,
          ] : [
            `There ${groups===1?'is':'are'} ${groups} equal ${groups===1?'group':'groups'}, with ${each} ${each===1?'object':'objects'} in each group.`,
            rest ? `Count ${first} groups: ${first} × ${each} = ${first*each}. Then count the remaining ${rest}: ${rest} × ${each} = ${rest*each}.` : `Count the objects in all ${groups} ${groups===1?'group':'groups'}: ${groups} × ${each} = ${answer}.`,
            rest ? `Put the parts together: ${first*each} + ${rest*each} = ${answer}. So ${groups} × ${each} = ${answer}.` : `The total is ${answer}. Multiplication counts all the objects, even when each group has zero.`,
          ], answer, trustedSteps:true };
      }
    }
  }
  if (['5.NF.A.1','4.NF.B.3'].includes(question.standard)) {
    const pairs=[...question.prompt.matchAll(/(\d+)\/(\d+)/g)].slice(0,2);
    if (pairs.length===2) {
      const [[n1,d1],[n2,d2]]=pairs.map(m=>[Number(m[1]),Number(m[2])]);
      const subtract=/^Subtract|Calculate[^?]*\d+\/\d+\s*-/.test(question.prompt);
      const denom=lcm(d1,d2), left=n1*(denom/d1), right=n2*(denom/d2), top=subtract?left-right:left+right;
      if (!d1 || !d2) return {...base,kind:"general",steps:[],visual:null,trustedSteps:false};
      const answer=new Rational(top,denom).toString();
      if (d1>0&&d2>0&&denom<=100&&top>=0&&isAnswerEquivalent(answer,question.correctAnswer)) return {
        ...base,kind:'fractions',firstHint:'Use the same-sized whole for both fractions. Before combining the pieces, make sure the pieces are the same size.',
        visual:{type:'guided-fractions',n1,d1,n2,d2,denominator:denom,left,right,operation:subtract?'-':'+'},
        steps:[
          `Use ${denom} equal parts in each whole. Each small part is 1/${denom}.`,
          `Rename the fractions without changing their values: ${n1}/${d1} = ${left}/${denom}, and ${n2}/${d2} = ${right}/${denom}.`,
          `${subtract?'Subtract':'Add'} the numerators: ${left} ${subtract?'-':'+'} ${right} = ${top}. Keep denominator ${denom}. The result is ${top}/${denom}${answer===`${top}/${denom}`?'.':`, which simplifies to ${answer}.`}`,
        ],answer,trustedSteps:true,
      };
    }
  }
  return {...base,kind:'general',visual:question.manipulative||null,steps:question.explanation?[question.explanation]:[],trustedSteps:false};
}

export const LESSON_STAGES = ['Try a clue', 'See a picture', 'Solve together'];
export function advanceLesson(stage) { return Math.min(2, Math.max(0, stage + 1)); }
