// Coalesces rapid repeat calls for the same logical action into a single
// trailing call — the fix for the classic "click twice fast" race: firing
// one network request per click gives no guarantee the responses land back
// in the order the clicks happened in, so whichever one resolves last wins
// server-side, even if it doesn't match the user's final click. Keying by a
// string lets unrelated actions (different tracks, different toggles) debounce
// independently instead of cancelling each other out.
const timers = new Map<string, ReturnType<typeof setTimeout>>();

export function debounceByKey(
  key: string,
  fn: () => void,
  delayMs = 400,
): void {
  const existing = timers.get(key);
  if (existing) clearTimeout(existing);
  timers.set(
    key,
    setTimeout(() => {
      timers.delete(key);
      fn();
    }, delayMs),
  );
}
