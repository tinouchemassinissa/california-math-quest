import {journeyCatalog} from './learningJourney.js';
// Collections reuse checked lessons; they do not imply full standards coverage.
export function lessonCollections(grade){
 const lessons=journeyCatalog(grade);
 const labels={K:['Small groups','Parts of ten'],'1':['Add and subtract','Missing parts'],'2':['Build a number','Digit values'],'3':['Equal groups','Multiply and divide'],'4':['Fraction parts','Add and subtract fractions'],'5':['Rename fractions','Combine and compare parts']};
 return [
  {id:'first-discovery',title:labels[grade][0],description:'Start with a picture, then try it yourself.',lessons:[lessons[0]]},
  {id:'next-discoveries',title:labels[grade][1],description:'Explore two related ideas with Bip.',lessons:lessons.slice(1)},
 ];
}
