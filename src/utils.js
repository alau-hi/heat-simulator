export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Fast binary search to find closest history frame safely
export function findClosestHistoryIndex(history, targetTime) {
  if (!history || history.length === 0) return 0;
  if (targetTime <= history[0].time) return 0;
  if (targetTime >= history[history.length - 1].time) return history.length - 1;

  let left = 0;
  let right = history.length - 1;
  let best = 0;

  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (history[mid].time <= targetTime) {
      best = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return best;
}
