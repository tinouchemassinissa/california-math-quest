import { generateVerifiedProblem } from '../mathEngine/problemGenerator.js';

const CACHE_KEY = 'california_curriculum_cache_v1';

/**
 * Dual-Mode Educational Content Service:
 * When online: can fetch supplementary items from open educational API feeds (e.g. OER open curriculum).
 * When offline or on network delay: seamlessly switches to the local Verified Mathematical Algorithm.
 */
export async function fetchEducationalQuestion({
  grade = '3',
  standardCode = null,
  seed = Date.now(),
  preferOnline = true,
  timeoutMs = 1200,
} = {}) {
  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;

  if (isOnline && preferOnline) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      // Attempt to load from public California / OER curriculum endpoint if configured
      // For resilience, we check a mockable/pluggable open endpoint
      const response = await fetch(
        `https://raw.githubusercontent.com/tinouchemassinissa/california-math-quest/main/public/curriculum_supplement.json`,
        { signal: controller.signal }
      ).catch(() => null);

      clearTimeout(timeoutId);

      if (response && response.ok) {
        const feed = await response.json();
        const candidateItems = feed?.items?.filter(
          (item) => item.grade === grade && (!standardCode || item.standard === standardCode)
        );

        if (candidateItems && candidateItems.length > 0) {
          const picked = candidateItems[Math.floor(Math.random() * candidateItems.length)];
          // Save to local cache
          cacheItem(picked);
          return {
            question: picked,
            source: 'online-feed',
            isOnline: true,
          };
        }
      }
    } catch {
      // Fall through to algorithmic engine on any network exception or timeout
    }
  }

  // Local Verified Mathematical Engine (PWA offline guarantee)
  const algorithmicQuestion = generateVerifiedProblem({
    grade,
    standardCode,
    seed,
  });

  return {
    question: algorithmicQuestion,
    source: 'local-verified-engine',
    isOnline: Boolean(isOnline),
  };
}

function cacheItem(item) {
  try {
    if (typeof localStorage === 'undefined') return;
    const existing = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
    if (!existing.some((x) => x.id === item.id)) {
      existing.push(item);
      localStorage.setItem(CACHE_KEY, JSON.stringify(existing.slice(-50)));
    }
  } catch {
    // ignore
  }
}
