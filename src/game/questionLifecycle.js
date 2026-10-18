// Only the newest question load may publish; an answer can be claimed once.
export function createQuestionLifecycle() {
  let revision = 0;
  let ready = false;
  let published = false;
  return {
    begin() { ready = false; published = false; return ++revision; },
    isCurrent(token) { return token === revision; },
    publish(token) { if (token !== revision || published) return false; published = true; ready = true; return true; },
    claim() { if (!ready) return false; ready = false; return true; },
  };
}
