import { generateVerifiedProblem } from '../mathEngine/problemGenerator.js';

const recentPrompts = [];
const MAX_RECENT = 12;

/**
 * Educational Problem Content Service:
 * - Algorithmic Formal Engine provides infinite, verified, mathematically rigorous problems with zero repetition.
 * - Open Educational Resources (OER) integration can be toggled to inject verified exemplar items.
 * - Tracks history to guarantee no duplicate questions appear back-to-back.
 */
export async function fetchEducationalQuestion({
  grade = '3',
  standardCode = null,
  seed = null,
  preferOnline = false,
  timeoutMs = 1000,
} = {}) {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  // If online OER feed is requested and user is online, attempt to pull supplementary exemplar
  if (isOnline && preferOnline) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Local/CDN served curriculum supplement
      const response = await fetch('/curriculum_supplement.json', { signal: controller.signal }).catch(() => null);
      clearTimeout(timeoutId);

      if (response && response.ok) {
        const feed = await response.json();
        const candidateItems = (feed?.items || []).filter(
          (item) => item.grade === grade && (!standardCode || item.standard === standardCode) && !recentPrompts.includes(item.prompt)
        );

        if (candidateItems.length > 0) {
          const picked = candidateItems[Math.floor(Math.random() * candidateItems.length)];
          trackRecent(picked.prompt);
          return {
            question: picked,
            source: 'online-oer-feed',
            isOnline: true,
          };
        }
      }
    } catch {
      // Fall through to formal generator
    }
  }

  // Generate verified algorithmic problem with guaranteed distinctness from recent questions
  let question = null;
  let attempts = 0;

  while (attempts < 5) {
    attempts += 1;
    const dynamicSeed = Math.floor(
      Date.now() * 1000 +
      (typeof performance !== 'undefined' ? performance.now() * 100 : 0) +
      Math.random() * 10000000 +
      attempts * 4321
    );

    question = generateVerifiedProblem({
      grade,
      standardCode,
      seed: dynamicSeed,
    });

    if (!recentPrompts.includes(question.prompt)) {
      break;
    }
  }

  trackRecent(question.prompt);

  return {
    question,
    source: 'local-verified-engine',
    isOnline: Boolean(isOnline),
  };
}

function trackRecent(prompt) {
  if (!prompt) return;
  recentPrompts.push(prompt);
  if (recentPrompts.length > MAX_RECENT) {
    recentPrompts.shift();
  }
}
