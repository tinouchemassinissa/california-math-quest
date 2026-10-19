import {readFileSync} from 'node:fs';
import {validatePublicContent} from '../src/game/publishedContent.js';
const questions=validatePublicContent(JSON.parse(readFileSync(new URL('../content/approved_questions.json',import.meta.url),'utf8')));
console.log(`Checked ${questions.length} approved shared questions.`);
